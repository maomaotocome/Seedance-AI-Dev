import { R2Provider, S3Provider, StorageManager } from '@/extensions/storage';
import { Configs, getAllConfigs } from '@/shared/models/config';

function normalizeStorageValue(value?: string) {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * get storage service with configs
 */
export function getStorageServiceWithConfigs(configs: Configs) {
  const storageManager = new StorageManager();

  const normalizedConfigs = {
    ...configs,
    r2_access_key: normalizeStorageValue(configs.r2_access_key),
    r2_secret_key: normalizeStorageValue(configs.r2_secret_key),
    r2_bucket_name: normalizeStorageValue(configs.r2_bucket_name),
    r2_account_id: normalizeStorageValue(configs.r2_account_id),
    r2_upload_path: normalizeStorageValue(configs.r2_upload_path),
    r2_endpoint: normalizeStorageValue(configs.r2_endpoint),
    r2_domain: normalizeStorageValue(configs.r2_domain),
    s3_access_key: normalizeStorageValue(configs.s3_access_key),
    s3_secret_key: normalizeStorageValue(configs.s3_secret_key),
    s3_bucket: normalizeStorageValue(configs.s3_bucket),
    s3_endpoint: normalizeStorageValue(configs.s3_endpoint),
    s3_region: normalizeStorageValue(configs.s3_region),
    s3_domain: normalizeStorageValue(configs.s3_domain),
  };

  // Add R2 provider if configured
  if (
    normalizedConfigs.r2_access_key &&
    normalizedConfigs.r2_secret_key &&
    normalizedConfigs.r2_bucket_name
  ) {
    // r2_region in settings stores the Cloudflare Account ID
    // For R2, region is typically "auto" but can be customized
    const accountId = normalizedConfigs.r2_account_id || '';

    storageManager.addProvider(
      new R2Provider({
        accountId: accountId,
        accessKeyId: normalizedConfigs.r2_access_key,
        secretAccessKey: normalizedConfigs.r2_secret_key,
        bucket: normalizedConfigs.r2_bucket_name,
        uploadPath: normalizedConfigs.r2_upload_path,
        region: 'auto', // R2 uses "auto" as region
        endpoint: normalizedConfigs.r2_endpoint, // Optional custom endpoint
        publicDomain: normalizedConfigs.r2_domain,
      }),
      true // Set R2 as default
    );
  }

  // Add S3 provider if configured (future support)
  if (
    normalizedConfigs.s3_access_key &&
    normalizedConfigs.s3_secret_key &&
    normalizedConfigs.s3_bucket
  ) {
    storageManager.addProvider(
      new S3Provider({
        endpoint: normalizedConfigs.s3_endpoint,
        region: normalizedConfigs.s3_region,
        accessKeyId: normalizedConfigs.s3_access_key,
        secretAccessKey: normalizedConfigs.s3_secret_key,
        bucket: normalizedConfigs.s3_bucket,
        publicDomain: normalizedConfigs.s3_domain,
      })
    );
  }

  return storageManager;
}

/**
 * global storage service
 */
let storageService: StorageManager | null = null;

/**
 * get storage service instance
 */
export async function getStorageService(
  configs?: Configs
): Promise<StorageManager> {
  if (!configs) {
    configs = await getAllConfigs();
  }
  storageService = getStorageServiceWithConfigs(configs);

  return storageService;
}
