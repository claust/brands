export interface Brand {
  id: string;
  name: string;
  owner_id: string;
  category: string;
}

export interface Company {
  id: string;
  name: string;
  parent_id: string | null;
}

export interface BrandsData {
  companies: Company[];
  brands: Brand[];
}

export interface LogoSearchResult {
  url: string;
  filename: string;
  width?: number;
  height?: number;
  size?: number;
  format?: string;
}

export interface BrandLogoData {
  brandId: string;
  brandName: string;
  searchDate: string;
  status: 'success' | 'failed' | 'skipped';
  logos: LogoSearchResult[];
  error?: string;
}

export interface SearchProgress {
  lastProcessedIndex: number;
  totalBrands: number;
  completedBrands: string[];
  failedBrands: string[];
  startTime: string;
  lastUpdateTime: string;
}

export interface LogoSearcherOptions {
  resume?: boolean;
  specificBrand?: string;
  maxLogosPerBrand?: number;
  delayBetweenSearches?: number;
  outputDir?: string;
  limit?: number;
}