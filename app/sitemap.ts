import type { MetadataRoute } from 'next';
import { siteUrl } from './lib/site';

/**
 * Google ignore les URL à fragment (#section) dans un sitemap : on ne déclare
 * donc que des URL réellement indexables.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: `${siteUrl}/`, lastModified, changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/bonus-hunt`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/casinos`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/boutique`, lastModified, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${siteUrl}/guide-bonus-hunt`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/jeu-responsable`, lastModified, changeFrequency: 'yearly', priority: 0.5 },
  ];
}
