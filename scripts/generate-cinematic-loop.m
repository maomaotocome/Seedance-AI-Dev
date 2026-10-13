#import <AVFoundation/AVFoundation.h>
#import <CoreGraphics/CoreGraphics.h>
#import <CoreVideo/CoreVideo.h>
#import <Foundation/Foundation.h>
#import <ImageIO/ImageIO.h>
#import <math.h>
#import <unistd.h>

static void fail(NSString *message, int code) {
  fprintf(stderr, "%s\n", message.UTF8String);
  exit(code);
}

int main(int argc, const char *argv[]) {
  @autoreleasepool {
    if (argc != 3) {
      fail(@"Usage: generate-cinematic-loop <input-image> <output-mp4>", 64);
    }

    NSURL *inputURL = [NSURL fileURLWithPath:[NSString stringWithUTF8String:argv[1]]];
    NSURL *outputURL = [NSURL fileURLWithPath:[NSString stringWithUTF8String:argv[2]]];
    const int width = 1280;
    const int height = 720;
    const int framesPerSecond = 24;
    const int frameCount = framesPerSecond * 6;

    CGImageSourceRef source = CGImageSourceCreateWithURL((__bridge CFURLRef)inputURL, NULL);
    if (!source) fail(@"Could not read the source image.", 65);
    CGImageRef sourceImage = CGImageSourceCreateImageAtIndex(source, 0, NULL);
    CFRelease(source);
    if (!sourceImage) fail(@"Could not decode the source image.", 65);

    [[NSFileManager defaultManager] removeItemAtURL:outputURL error:nil];
    NSError *error = nil;
    AVAssetWriter *writer = [[AVAssetWriter alloc] initWithURL:outputURL
                                                      fileType:AVFileTypeMPEG4
                                                         error:&error];
    if (!writer) fail(error.localizedDescription ?: @"Could not create the video writer.", 66);

    NSDictionary *compression = @{
      AVVideoAverageBitRateKey: @1600000,
      AVVideoExpectedSourceFrameRateKey: @(framesPerSecond),
      AVVideoMaxKeyFrameIntervalKey: @(framesPerSecond * 2),
      AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
    };
    NSDictionary *settings = @{
      AVVideoCodecKey: AVVideoCodecTypeH264,
      AVVideoWidthKey: @(width),
      AVVideoHeightKey: @(height),
      AVVideoCompressionPropertiesKey: compression,
    };
    AVAssetWriterInput *writerInput = [AVAssetWriterInput assetWriterInputWithMediaType:AVMediaTypeVideo
                                                                          outputSettings:settings];
    writerInput.expectsMediaDataInRealTime = NO;
    NSDictionary *attributes = @{
      (NSString *)kCVPixelBufferPixelFormatTypeKey: @(kCVPixelFormatType_32ARGB),
      (NSString *)kCVPixelBufferWidthKey: @(width),
      (NSString *)kCVPixelBufferHeightKey: @(height),
      (NSString *)kCVPixelBufferCGImageCompatibilityKey: @YES,
      (NSString *)kCVPixelBufferCGBitmapContextCompatibilityKey: @YES,
    };
    AVAssetWriterInputPixelBufferAdaptor *adaptor =
      [AVAssetWriterInputPixelBufferAdaptor assetWriterInputPixelBufferAdaptorWithAssetWriterInput:writerInput
                                                                       sourcePixelBufferAttributes:attributes];

    if (![writer canAddInput:writerInput]) fail(@"The video writer could not add its input.", 67);
    [writer addInput:writerInput];
    if (![writer startWriting]) fail(writer.error.localizedDescription ?: @"The video writer could not start.", 68);
    [writer startSessionAtSourceTime:kCMTimeZero];

    for (int frameIndex = 0; frameIndex < frameCount; frameIndex++) {
      while (!writerInput.readyForMoreMediaData) usleep(2000);

      CVPixelBufferRef pixelBuffer = NULL;
      CVReturn result = CVPixelBufferPoolCreatePixelBuffer(NULL, adaptor.pixelBufferPool, &pixelBuffer);
      if (result != kCVReturnSuccess || !pixelBuffer) fail(@"Could not allocate a video frame.", 69);

      CVPixelBufferLockBaseAddress(pixelBuffer, 0);
      CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
      CGContextRef context = CGBitmapContextCreate(
        CVPixelBufferGetBaseAddress(pixelBuffer), width, height, 8,
        CVPixelBufferGetBytesPerRow(pixelBuffer), colorSpace,
        (CGBitmapInfo)kCGImageAlphaNoneSkipFirst
      );
      CGColorSpaceRelease(colorSpace);
      if (!context) fail(@"Could not create a frame context.", 70);

      CGContextSetRGBFillColor(context, 0.03, 0.035, 0.032, 1);
      CGContextFillRect(context, CGRectMake(0, 0, width, height));
      CGContextSetInterpolationQuality(context, kCGInterpolationHigh);

      double progress = (double)frameIndex / (double)(frameCount - 1);
      double seamlessEase = 0.5 - 0.5 * cos(progress * 2.0 * M_PI);
      double scale = 1.0 + 0.048 * seamlessEase;
      CGFloat drawWidth = width * scale;
      CGFloat drawHeight = height * scale;
      CGFloat panX = 10.0 * sin(progress * 2.0 * M_PI);
      CGFloat panY = 4.0 * sin(progress * 2.0 * M_PI + M_PI_2);
      CGRect imageRect = CGRectMake(
        (width - drawWidth) / 2.0 + panX,
        (height - drawHeight) / 2.0 + panY,
        drawWidth,
        drawHeight
      );
      CGContextDrawImage(context, imageRect, sourceImage);
      CGContextRelease(context);

      CMTime presentationTime = CMTimeMake(frameIndex, framesPerSecond);
      if (![adaptor appendPixelBuffer:pixelBuffer withPresentationTime:presentationTime]) {
        CVPixelBufferUnlockBaseAddress(pixelBuffer, 0);
        CVPixelBufferRelease(pixelBuffer);
        fail(@"Could not append a video frame.", 71);
      }
      CVPixelBufferUnlockBaseAddress(pixelBuffer, 0);
      CVPixelBufferRelease(pixelBuffer);
    }

    CGImageRelease(sourceImage);
    [writerInput markAsFinished];
    dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);
    [writer finishWritingWithCompletionHandler:^{ dispatch_semaphore_signal(semaphore); }];
    dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER);

    if (writer.status != AVAssetWriterStatusCompleted) {
      fail(writer.error.localizedDescription ?: @"Video export failed.", 72);
    }

    printf("%s\n", outputURL.path.UTF8String);
  }
  return 0;
}
