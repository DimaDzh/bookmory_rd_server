export interface GoogleBooksVolumeInfo {
  title: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  industryIdentifiers?: Array<{
    type: string;
    identifier: string;
  }>;
  readingModes?: {
    text: boolean;
    image: boolean;
  };
  pageCount?: number;
  printType?: string;
  categories?: string[];
  averageRating?: number;
  ratingsCount?: number;
  maturityRating?: string;
  allowAnonLogging?: boolean;
  contentVersion?: string;
  panelizationSummary?: {
    containsEpubBubbles: boolean;
    containsImageBubbles: boolean;
  };
  imageLinks?: {
    smallThumbnail?: string;
    thumbnail?: string;
    small?: string;
    medium?: string;
    large?: string;
    extraLarge?: string;
  };
  language?: string;
  previewLink?: string;
  infoLink?: string;
  canonicalVolumeLink?: string;
}

export interface GoogleBooksSaleInfo {
  country?: string;
  saleability?: string;
  isEbook?: boolean;
  listPrice?: {
    amount: number;
    currencyCode: string;
  };
  retailPrice?: {
    amount: number;
    currencyCode: string;
  };
  buyLink?: string;
  offers?: Array<{
    finskyOfferType: number;
    listPrice: {
      amountInMicros: number;
      currencyCode: string;
    };
    retailPrice: {
      amountInMicros: number;
      currencyCode: string;
    };
  }>;
}

export interface GoogleBooksAccessInfo {
  country?: string;
  viewability?: string;
  embeddable?: boolean;
  publicDomain?: boolean;
  textToSpeechPermission?: string;
  epub?: {
    isAvailable: boolean;
    acsTokenLink?: string;
  };
  pdf?: {
    isAvailable: boolean;
    acsTokenLink?: string;
  };
  webReaderLink?: string;
  accessViewStatus?: string;
  quoteSharingAllowed?: boolean;
}

export interface GoogleBooksSearchInfo {
  textSnippet?: string;
}

export interface GoogleBooksVolume {
  kind: string;
  id: string;
  etag?: string;
  selfLink: string;
  volumeInfo: GoogleBooksVolumeInfo;
  saleInfo?: GoogleBooksSaleInfo;
  accessInfo?: GoogleBooksAccessInfo;
  searchInfo?: GoogleBooksSearchInfo;
}

export interface GoogleBooksSearchResponse {
  kind: string;
  totalItems: number;
  items?: GoogleBooksVolume[];
}

export interface GoogleBooksSearchParams {
  query: string;
  maxResults?: number;
  startIndex?: number;
  langRestrict?: string;
  printType?: 'all' | 'books' | 'magazines';
  orderBy?: 'newest' | 'relevance';
  filter?: 'ebooks' | 'free-ebooks' | 'full' | 'paid-ebooks' | 'partial';
  projection?: 'full' | 'lite';
}

export interface GoogleBooksConfig {
  apiKey?: string; // Optional - API works without key but with rate limits
  baseUrl: string;
  timeout?: number;
}
