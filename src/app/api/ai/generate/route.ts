import { envConfigs } from '@/config';
import {
  buildSeedanceProviderOptions,
  getSeedanceProviderModel,
  isSeedanceProductModel,
  SeedanceScene,
} from '@/config/seedance';
import {
  buildKieVideoInput,
  calculateVideoCredits,
  getKieVideoModel,
  getVideoModelConfig,
  isNewVideoProductModel,
  isVideoProductModel,
  normalizeVideoAspectRatio,
  normalizeVideoDuration,
  normalizeVideoResolution,
  VideoScene,
} from '@/config/video-models';
import { AIMediaType } from '@/extensions/ai';
import { getUuid } from '@/shared/lib/hash';
import { respData, respErr } from '@/shared/lib/resp';
import { createAITask, NewAITask } from '@/shared/models/ai_task';
import { getAllConfigs } from '@/shared/models/config';
import { getRemainingCredits } from '@/shared/models/credit';
import { getUserInfo } from '@/shared/models/user';
import { getAIService } from '@/shared/services/ai';
import {
  getProfitProtectedSeedanceCandidates,
  SeedanceProvidersUnavailableError,
  submitSeedanceWithProviders,
} from '@/shared/services/seedance-provider';

const MAX_PRODUCT_VIDEO_PROMPT_LENGTH = 4_000;

function normalizePublicAssetUrls(
  value: unknown,
  maxItems: number,
  fieldName: string
) {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} must be an array`);
  }
  if (value.length > maxItems) {
    throw new Error(`${fieldName} exceeds the ${maxItems}-item limit`);
  }

  return value.map((item) => {
    if (typeof item !== 'string') {
      throw new Error(`${fieldName} contains an invalid URL`);
    }

    let url: URL;
    try {
      url = new URL(item);
    } catch {
      throw new Error(`${fieldName} contains an invalid URL`);
    }

    const hostname = url.hostname.toLowerCase();
    const isPrivateHost =
      hostname === 'localhost' ||
      hostname === '0.0.0.0' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname.endsWith('.local') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(hostname);

    if (!['http:', 'https:'].includes(url.protocol) || isPrivateHost) {
      throw new Error(`${fieldName} must contain public HTTP(S) URLs`);
    }

    return url.toString();
  });
}

export async function POST(request: Request) {
  try {
    let { provider, mediaType, model, prompt, options, scene } =
      await request.json();

    if (!mediaType || !model) {
      throw new Error('invalid params');
    }

    if (!prompt && !options) {
      throw new Error('prompt or options is required');
    }

    const configs = await getAllConfigs();
    const aiService = await getAIService(configs);

    // check generate type
    if (!aiService.getMediaTypes().includes(mediaType)) {
      throw new Error('invalid mediaType');
    }

    // get current user
    const user = await getUserInfo();
    if (!user) {
      throw new Error('no auth, please sign in');
    }

    const isProductVideoRequest =
      mediaType === AIMediaType.VIDEO && isVideoProductModel(model);
    const isSeedanceRequest =
      isProductVideoRequest && isSeedanceProductModel(model);

    if (
      !isProductVideoRequest &&
      options &&
      typeof options === 'object' &&
      !Array.isArray(options) &&
      'provider_input' in options
    ) {
      options = { ...options };
      delete options.provider_input;
    }

    if (isProductVideoRequest) {
      if (typeof prompt !== 'string' || !prompt.trim()) {
        throw new Error('A video prompt is required');
      }
      if (prompt.trim().length > MAX_PRODUCT_VIDEO_PROMPT_LENGTH) {
        throw new Error('The video prompt is too long');
      }
      if (!options || typeof options !== 'object' || Array.isArray(options)) {
        throw new Error('Invalid video options');
      }

      const modelConfig = getVideoModelConfig(model);
      if (!modelConfig.scenes.includes(scene as VideoScene)) {
        throw new Error('This workflow is not supported by the selected model');
      }

      prompt = prompt.trim();
      const maxImages =
        scene === 'image-to-video' && isSeedanceRequest
          ? 2
          : modelConfig.maxImages;
      const imageInput = normalizePublicAssetUrls(
        options.image_input,
        maxImages,
        'image_input'
      );
      const videoInput = normalizePublicAssetUrls(
        options.video_input,
        10,
        'video_input'
      );
      const audioInput = normalizePublicAssetUrls(
        options.audio_input,
        10,
        'audio_input'
      );

      if (isSeedanceRequest && videoInput.length > 0) {
        throw new Error(
          'Reference video input is not available until its duration can be priced before submission'
        );
      }

      if (scene === 'image-to-video' && imageInput.length === 0) {
        throw new Error('image-to-video requires a start frame');
      }
      if (
        scene === 'reference-to-video' &&
        imageInput.length + videoInput.length + audioInput.length === 0
      ) {
        throw new Error('reference-to-video requires reference media');
      }

      options = {
        ...options,
        resolution: normalizeVideoResolution(model, options.resolution),
        duration: normalizeVideoDuration(model, options.duration),
        aspect_ratio: normalizeVideoAspectRatio(model, options.aspect_ratio),
        generate_audio:
          modelConfig.audio === 'toggle' && options.generate_audio !== false,
        image_input: imageInput,
        video_input: videoInput,
        audio_input: audioInput,
      };
    }

    // todo: get non-Seedance cost credits from settings
    let costCredits = 2;

    if (mediaType === AIMediaType.IMAGE) {
      // generate image
      if (scene === 'image-to-image') {
        costCredits = 4;
      } else if (scene === 'text-to-image') {
        costCredits = 2;
      } else {
        throw new Error('invalid scene');
      }
    } else if (mediaType === AIMediaType.VIDEO) {
      // generate video
      if (isProductVideoRequest) {
        costCredits = calculateVideoCredits({
          model,
          resolution: options?.resolution,
          duration: options?.duration,
          generateAudio: options?.generate_audio,
        });
      } else if (scene === 'text-to-video') {
        costCredits = 6;
      } else if (scene === 'image-to-video') {
        costCredits = 8;
      } else if (scene === 'video-to-video') {
        costCredits = 10;
      } else {
        throw new Error('invalid scene');
      }
    } else if (mediaType === AIMediaType.MUSIC) {
      // generate music
      costCredits = 10;
      scene = 'text-to-music';
    } else {
      throw new Error('invalid mediaType');
    }

    // check credits
    const remainingCredits = await getRemainingCredits(user.id);
    if (remainingCredits < costCredits) {
      throw new Error('insufficient credits');
    }

    let resolvedProvider = provider;
    let resolvedModel = model;
    let resolvedOptions = options;
    let result;

    if (isSeedanceRequest) {
      const candidates = getProfitProtectedSeedanceCandidates({
        kieConfigured: Boolean(aiService.getProvider('kie')),
        falConfigured: Boolean(aiService.getProvider('fal')),
      });

      if (candidates.length === 0) {
        throw new Error(
          'Seedance is not configured. Add a Kie API key in admin settings.'
        );
      }

      try {
        const submission = await submitSeedanceWithProviders({
          candidates,
          submit: async (candidate) => {
            const candidateProvider = aiService.getProvider(candidate);
            if (!candidateProvider) {
              throw new Error(`${candidate} provider is not configured`);
            }

            const candidateModel = getSeedanceProviderModel({
              provider: candidate,
              productModel: model,
              scene: scene as SeedanceScene,
            });
            const candidateOptions = buildSeedanceProviderOptions({
              provider: candidate,
              scene: scene as SeedanceScene,
              options: options || {},
              endUserId: user.id,
            });

            const candidateResult = await candidateProvider.generate({
              params: {
                mediaType,
                model: candidateModel,
                prompt,
                options: candidateOptions,
              },
            });
            return {
              result: candidateResult,
              model: candidateModel,
              options: candidateOptions,
            };
          },
        });

        result = submission.result.result;
        resolvedProvider = submission.provider;
        resolvedModel = submission.result.model;
        resolvedOptions = {
          ...submission.result.options,
          product_model: model,
        };
      } catch (error) {
        if (error instanceof SeedanceProvidersUnavailableError) {
          console.error('Seedance provider submissions failed', error.failures);
        }
        throw error;
      }
    } else if (isProductVideoRequest && isNewVideoProductModel(model)) {
      const kieProvider = aiService.getProvider('kie');
      if (!kieProvider) {
        throw new Error(
          'This video model is not configured. Add a Kie API key in admin settings.'
        );
      }

      const normalizedScene = scene as VideoScene;
      const providerModel = getKieVideoModel(model, normalizedScene);
      const providerInput = buildKieVideoInput({
        model,
        scene: normalizedScene,
        prompt,
        options,
      });
      const providerOptions = { provider_input: providerInput };
      const callbackUrl = `${envConfigs.app_url}/api/ai/notify/kie`;

      result = await kieProvider.generate({
        params: {
          mediaType,
          model: providerModel,
          prompt,
          callbackUrl,
          options: providerOptions,
        },
      });
      resolvedProvider = 'kie';
      resolvedModel = providerModel;
      resolvedOptions = {
        ...options,
        ...providerOptions,
        product_model: model,
      };
    } else {
      if (!provider) {
        throw new Error('invalid provider');
      }
      const aiProvider = aiService.getProvider(provider);
      if (!aiProvider) {
        throw new Error('invalid provider');
      }

      const callbackUrl = `${envConfigs.app_url}/api/ai/notify/${provider}`;
      result = await aiProvider.generate({
        params: {
          mediaType,
          model,
          prompt,
          callbackUrl,
          options,
        },
      });
    }

    if (!result?.taskId) {
      throw new Error(
        `ai generate failed, mediaType: ${mediaType}, provider: ${resolvedProvider}, model: ${resolvedModel}`
      );
    }

    // create ai task
    const newAITask: NewAITask = {
      id: getUuid(),
      userId: user.id,
      mediaType,
      provider: resolvedProvider,
      model: resolvedModel,
      prompt,
      scene,
      options: resolvedOptions ? JSON.stringify(resolvedOptions) : null,
      status: result.taskStatus,
      costCredits,
      taskId: result.taskId,
      taskInfo: result.taskInfo ? JSON.stringify(result.taskInfo) : null,
      taskResult: result.taskResult ? JSON.stringify(result.taskResult) : null,
    };
    await createAITask(newAITask);

    return respData(newAITask);
  } catch (e: any) {
    console.log('generate failed', e);
    return respErr(e.message);
  }
}
