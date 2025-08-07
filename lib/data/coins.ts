import { MarketData, ShareListing } from './market';

export interface CoinData {
  id: string;
  name: string;
  description: string;
  image: string;
  grade: string;
  topGradedPopulation: number;
  totalMintage: number;
  gemSurvivalEstimate: number;
  retailValue: number;
  annualAppreciation: number;
  previousSales: {
    price: number;
    year: number;
  }[];
  notes: string;
  rarity: 'scarce' | 'rare' | 'legendary';
  // Share and market data
  totalShares: number;
  soldShares: number;
  owners: number;
  market: MarketData;
}

// Helper function to create default market data
function createDefaultMarket(retailValue: number, totalShares: number, soldShares: number, coinId?: string): MarketData {
  const initialSharePrice = retailValue / totalShares;
  const currentMarketPrice = initialSharePrice * 1.1; // 10% markup for demonstration

  // Create a more diverse set of share listings
  const availableShares: ShareListing[] = [
    // Platform's original shares (40% of remaining)
    {
      price: currentMarketPrice,
      quantity: Math.floor((totalShares - soldShares) * 0.4),
      isOriginalShares: true
    },
    // Early investor resale (20% of remaining at 5% markup)
    {
      price: currentMarketPrice * 1.05,
      quantity: Math.floor((totalShares - soldShares) * 0.2),
      isOriginalShares: false
    },
    // Higher priced listings (10% of remaining at 10% markup)
    {
      price: currentMarketPrice * 1.1,
      quantity: Math.floor((totalShares - soldShares) * 0.1),
      isOriginalShares: false
    }
  ].filter(listing => listing.quantity > 0);

  // Add demo portfolio listings
  if (coinId === '1909-s-vdb-lincoln-cent') {
    availableShares.push({
      price: 165, // $165,000 / 1000 shares
      quantity: 20,
      isOriginalShares: false,
      isUserListing: true
    });
  } else if (coinId === '1916-d-mercury-dime') {
    availableShares.push({
      price: 250, // $250,000 / 1000 shares
      quantity: 15,
      isOriginalShares: false,
      isUserListing: true
    });
  } else if (coinId === '1879-seated-liberty-quarter') {
    availableShares.push({
      price: 100, // $100,000 / 1000 shares
      quantity: 25,
      isOriginalShares: false,
      isUserListing: true
    });
  } else if (coinId === '1841-seated-liberty-half-dime') {
    availableShares.push({
      price: 50, // $50,000 / 1000 shares
      quantity: 50,
      isOriginalShares: false,
      isUserListing: true
    });
  }

  // Sort by price ascending
  availableShares.sort((a, b) => a.price - b.price);

  return {
    initialSharePrice,
    currentMarketPrice,
    availableShares
  };
}

// Update the 1794 Flowing Hair Dollar market data
const flowingHairMarket: MarketData = {
  initialSharePrice: 15000, // $15M / 1000 shares
  currentMarketPrice: 16500, // Mocked higher due to demand
  availableShares: [
    {
      price: 16500,
      quantity: 50,
      isOriginalShares: true
    },
    {
      price: 17000,
      quantity: 25,
      isOriginalShares: false
    },
    {
      price: 17500,
      quantity: 15,
      isOriginalShares: false
    },
    {
      price: 18000,
      quantity: 10,
      isOriginalShares: false
    }
  ]
};

export const coins: CoinData[] = [
  {
    id: '1794-flowing-hair',
    name: '1794 Flowing Silver Hair Dollar',
    description: 'First US silver dollar ever made and the most valuable coin in the multi-thousand year history of this sector',
    image: '/images/coins/1794 Flowing Silver Hair Dollar.webp',
    grade: 'SP-66+',
    topGradedPopulation: 1,
    totalMintage: 1758,
    gemSurvivalEstimate: 2,
    retailValue: 15000000,
    totalShares: 1000,
    soldShares: 750,
    owners: 250,
    annualAppreciation: 15,
    previousSales: [
      { price: 10016000, year: 2013 },
      { price: 500000, year: 1988 },
      { price: 50000, year: 1970 }
    ],
    notes: 'First US silver dollar ever made and the most valuable coin in the multi-thousand year history of this sector',
    rarity: 'legendary',
    market: flowingHairMarket
  },
  {
    id: '1804-draped-bust',
    name: '1804 Draped Bust Silver Dollar',
    description: 'Made in the 1830s as high-end diplomatic gifts, known as "The King of US Collectible Coins". First coin to break both $100k and $1 million',
    image: '/images/coins/1804 Draped Bust Silver Dollar.webp',
    grade: 'PR-68',
    topGradedPopulation: 1,
    totalMintage: 15,
    gemSurvivalEstimate: 4,
    retailValue: 10000000,
    totalShares: 1000,
    soldShares: 600,
    owners: 150,
    annualAppreciation: 12,
    previousSales: [
      { price: 7680000, year: 2021 },
      { price: 4140000, year: 1999 }
    ],
    notes: 'Made in the 1830s as high-end diplomatic gifts, known as "The King of US Collectible Coins". First coin to break both $100k and $1 million',
    rarity: 'legendary',
    market: createDefaultMarket(10000000, 1000, 600, '1804-draped-bust')
  },
  {
    id: '1913-liberty-nickel',
    name: '1913 Liberty Head Nickel',
    description: 'Very famous backstory, made by the mint after the series was discontinued for unknown reasons',
    image: '/images/coins/1913 Liberty Head Nickel.webp',
    grade: 'PR-66',
    topGradedPopulation: 1,
    totalMintage: 5,
    gemSurvivalEstimate: 1,
    retailValue: 6750000,
    totalShares: 1000,
    soldShares: 200,
    owners: 40,
    annualAppreciation: 10,
    previousSales: [
      { price: 4560000, year: 2018 },
      { price: 1840000, year: 2001 },
      { price: 100000, year: 1972 }
    ],
    notes: 'Very famous backstory, made by the mint after the series was discontinued for unknown reasons',
    rarity: 'legendary',
    market: createDefaultMarket(6750000, 1000, 200, '1913-liberty-nickel')
  },
  {
    id: '1894-s-barber-dime',
    name: '1894-S Barber Dime',
    description: '24 made as presentation pieces, only 9 survived. A true numismatic treasure.',
    image: '/images/coins/1894-S Barber Dime.webp',
    grade: 'PR-66',
    topGradedPopulation: 2,
    totalMintage: 24,
    gemSurvivalEstimate: 4,
    retailValue: 2550000,
    totalShares: 1000,
    soldShares: 700,
    owners: 175,
    annualAppreciation: 12,
    previousSales: [
      { price: 2160000, year: 2025 },
      { price: 1500000, year: 2020 },
      { price: 1322500, year: 2005 }
    ],
    notes: '24 made as presentation pieces, only 9 survived',
    rarity: 'legendary',
    market: createDefaultMarket(2550000, 1000, 700, '1894-s-barber-dime')
  },
  {
    id: '1909-s-vdb-lincoln-cent',
    name: '1909-S VDB Lincoln Cent',
    description: 'Most famous 1c in American history, with V.D.B proudly displaying the designer\'s initials',
    image: '/images/coins/1909-S VDB Lincoln Cent.webp',
    grade: 'MS-67 RD',
    topGradedPopulation: 20,
    totalMintage: 484000,
    gemSurvivalEstimate: 3000,
    retailValue: 165000,
    totalShares: 1000,
    soldShares: 750,
    owners: 250,
    annualAppreciation: 15,
    previousSales: [
      { price: 168000, year: 2022 },
      { price: 108000, year: 2022 },
      { price: 50400, year: 2019 }
    ],
    notes: 'Most famous 1c in American history, with V.D.B proudly displaying the designer\'s initials',
    rarity: 'rare',
    market: createDefaultMarket(165000, 1000, 750, '1909-s-vdb-lincoln-cent')
  },
  {
    id: '1916-d-mercury-dime',
    name: '1916-D Mercury Dime',
    description: 'Lowest mintage of any Mercury dime, only 75 thought to survive in gem condition',
    image: '/images/coins/1916-D Mercury Dime.webp',
    grade: 'MS-67 FB',
    topGradedPopulation: 10,
    totalMintage: 264000,
    gemSurvivalEstimate: 75,
    retailValue: 250000,
    totalShares: 1000,
    soldShares: 600,
    owners: 150,
    annualAppreciation: 8,
    previousSales: [
      { price: 204000, year: 2020 },
      { price: 152750, year: 2013 },
      { price: 97750, year: 2009 }
    ],
    notes: 'Lowest mintage of any Mercury dime, only 75 though to survive in gem condition with far less having full bands (FB)',
    rarity: 'rare',
    market: createDefaultMarket(250000, 1000, 600, '1916-d-mercury-dime')
  },
  {
    id: '1949-s-roosevelt-dime',
    name: '1949-S Roosevelt Dime',
    description: 'Newly discovered in 2020, selling at 4x the previous MS-67+ record high',
    image: '/images/coins/1949-S Roosevelt Dime.webp',
    grade: 'MS-68 FB',
    topGradedPopulation: 1,
    totalMintage: 13510000,
    gemSurvivalEstimate: 10000,
    retailValue: 10500,
    totalShares: 1000,
    soldShares: 750,
    owners: 250,
    annualAppreciation: 11,
    previousSales: [
      { price: 13200, year: 2021 },
      { price: 11812, year: 2020 }
    ],
    notes: 'Newly discovered in 2020, selling at 4x the previous MS-67+ record high',
    rarity: 'scarce',
    market: createDefaultMarket(10500, 1000, 750, '1949-s-roosevelt-dime')
  },
  {
    id: '1953-s-jefferson-nickel',
    name: '1953-S Jefferson Nickel',
    description: 'The rarest Jefferson nickel in terms of the coveted "full steps" designation',
    image: '/images/coins/1953-S Jefferson Nickel.webp',
    grade: 'MS-66 FS',
    topGradedPopulation: 2,
    totalMintage: 19210900,
    gemSurvivalEstimate: 1000,
    retailValue: 23000,
    totalShares: 1000,
    soldShares: 600,
    owners: 150,
    annualAppreciation: 12,
    previousSales: [
      { price: 21600, year: 2021 },
      { price: 13200, year: 2021 }
    ],
    notes: 'The rarest Jefferson nickel in terms of the coveted "full steps" designation, referring to a pristine minting of the stairs on the capital building',
    rarity: 'rare',
    market: createDefaultMarket(23000, 1000, 600, '1953-s-jefferson-nickel')
  },
  {
    id: '1932-d-washington-quarter',
    name: '1932-D Washington Quarter',
    description: 'Key date Washington Quarter, the crown jewel in any quarter collection',
    image: '/images/coins/1932-D Washington Quarter.webp',
    grade: 'MS-65+',
    topGradedPopulation: 9,
    totalMintage: 436800,
    gemSurvivalEstimate: 650,
    retailValue: 26000,
    totalShares: 1000,
    soldShares: 800,
    owners: 267,
    annualAppreciation: 48,
    previousSales: [
      { price: 29375, year: 2021 },
      { price: 16200, year: 2021 },
      { price: 1000, year: 1985 }
    ],
    notes: 'Key date Washington Quarter, the crown jewel in any quarter collection',
    rarity: 'rare',
    market: createDefaultMarket(26000, 1000, 800, '1932-d-washington-quarter')
  },
  {
    id: '1960-d-washington-quarter',
    name: '1960-D Washington Quarter',
    description: 'Sleeper Washington Quarter year with the first ever example being upgraded from MS-67+ to MS-68 by NGC in 2008',
    image: '/images/coins/1960-D Washington Quarter.webp',
    grade: 'MS-68',
    topGradedPopulation: 1,
    totalMintage: 63000324,
    gemSurvivalEstimate: 10000,
    retailValue: 7500,
    totalShares: 1000,
    soldShares: 800,
    owners: 267,
    annualAppreciation: 7,
    previousSales: [
      { price: 7031.25, year: 2024 },
      { price: 9000, year: 2019 },
      { price: 4887.50, year: 2008 }
    ],
    notes: 'Sleeper Washington Quarter year with the first ever example being upgraded from MS-67+ to MS-68 by NGC in 2008',
    rarity: 'scarce',
    market: createDefaultMarket(7500, 1000, 800, '1960-d-washington-quarter')
  },
  {
    id: '1967-washington-quarter',  
    name: '1967 Washington Quarter',
    description: 'Despite the massive mintage, a very small handful have reached the coveted MS-69 mark',
    image: '/images/coins/1967 Washington Quarter.webp',
    grade: 'MS-69',
    topGradedPopulation: 3,
    totalMintage: 1524031848,
    gemSurvivalEstimate: 22860477,
    retailValue: 8000,
    totalShares: 1000,
    soldShares: 850,
    owners: 283,
    annualAppreciation: 6,
    previousSales: [
      { price: 8100, year: 2024 },
      { price: 4800, year: 2019 },
      { price: 8800, year: 2017 }
    ],
    notes: 'Despite the massive mintage (or perhaps thanks to it), a very small handful have reached the coveted MS-69 mark, indicating a near-perfect example of this familiar 25c piece',
    rarity: 'scarce',
    market: createDefaultMarket(8000, 1000, 850, '1967-washington-quarter')
  },
  {
    id: '1953-s-franklin-half-dollar',
    name: '1953-S Franklin Half Dollar',
    description: 'Less than 50 total graded with the coveted full bell lines (FBL) designation',
    image: '/images/coins/1953-S Franklin Half Dollar.webp',
    grade: 'MS-66 FBL',
    topGradedPopulation: 2,
    totalMintage: 4148000,
    gemSurvivalEstimate: 100,
    retailValue: 60000,
    totalShares: 1000,
    soldShares: 700,
    owners: 175,
    annualAppreciation: 9,
    previousSales: [
      { price: 66000, year: 2024 },
      { price: 35075, year: 2001 }
    ],
    notes: 'Less than 50 total graded with the coveted full bell lines (FBL) designation, indicating a near perfect representation of the bell on the reverse of the coin',
    rarity: 'rare',
    market: createDefaultMarket(60000, 1000, 700, '1953-s-franklin-half-dollar')
  },
  {
    id: '1841-seated-liberty-half-dime',
    name: '1841 Seated Liberty Half Dime',
    description: 'Highly sought after year with a relatively low mintage and very few surviving "superb gem" examples',
    image: '/images/coins/1841 Seated Liberty Half Dime.webp',
    grade: 'MS-67',
    topGradedPopulation: 4,
    totalMintage: 1150000,
    gemSurvivalEstimate: 30,
    retailValue: 50000,
    totalShares: 1000,
    soldShares: 750,
    owners: 250,
    annualAppreciation: 5,
    previousSales: [
      { price: 5500, year: 2023 },
      { price: 4113, year: 2013 },
      { price: 3220, year: 2011 }
    ],
    notes: 'Highly sought after year with a relatively low mintage and very few surviving "superb gem" aka MS-66 or higher examples',
    rarity: 'scarce',
    market: createDefaultMarket(50000, 1000, 750, '1841-seated-liberty-half-dime')
  },
  {
    id: '1879-seated-liberty-quarter',
    name: '1879 Seated Liberty Quarter',
    description: 'Highly sought after year with a relatively low mintage and very few surviving "superb gem" examples',
    image: '/images/coins/1879 Seated Liberty Quarter.webp',
    grade: 'MS-67',
    topGradedPopulation: 4,
    totalMintage: 1150000,
    gemSurvivalEstimate: 30,
    retailValue: 100000,
    totalShares: 1000,
    soldShares: 750,
    owners: 250,
    annualAppreciation: 5,
    previousSales: [
      { price: 5500, year: 2023 },
      { price: 4113, year: 2013 },
      { price: 3220, year: 2011 }
    ],
    notes: 'Highly sought after year with a relatively low mintage and very few surviving "superb gem" aka MS-66 or higher examples',
    rarity: 'scarce',
    market: createDefaultMarket(100000, 1000, 750, '1879-seated-liberty-quarter')
  },
  {
    id: '1911-barber-dime',
    name: '1911 Barber Dime',
    description: 'A beautifully toned example of the classic Barber Dime type',
    image: '/images/coins/1911 Barber Dime.webp',
    grade: 'MS-68+',
    topGradedPopulation: 1,
    totalMintage: 18770000,
    gemSurvivalEstimate: 750,
    retailValue: 35000,
    totalShares: 1000,
    soldShares: 800,
    owners: 267,
    annualAppreciation: 15,
    previousSales: [
      { price: 30500, year: 2014 }
    ],
    notes: 'A beautifully toned example of the classic Barber Dime type. Only appeared at auction once in 2014 with only 1 MS-68+ example, making the theoretical valuation as high as a registry collector is willing to pay for it with less upfront cost than many other types',
    rarity: 'rare',
    market: createDefaultMarket(35000, 1000, 800, '1911-barber-dime')
  },
  {
    id: '1895-o-barber-half-dollar',
    name: '1895-O Barber Half Dollar',
    description: 'A rare example of an often overlooked 50c type',
    image: '/images/coins/1895-O Barber Half Dollar.webp',
    grade: 'MS-67',
    topGradedPopulation: 2,
    totalMintage: 2052000,
    gemSurvivalEstimate: 40,
    retailValue: 35000,
    totalShares: 1000,
    soldShares: 700,
    owners: 175,
    annualAppreciation: 8,
    previousSales: [
      { price: 32900, year: 2021 }
    ],
    notes: 'A rare example of an often overlooked 50c type, this Barber 50c rarely appears at auctions and tends to experience periods of high volatility as attention is occasionally brought to its relative scarcity',
    rarity: 'rare',
    market: createDefaultMarket(35000, 1000, 700, '1895-o-barber-half-dollar')
  },
];

// Helper function to determine rarity based on survival estimate and value
export function determineRarity(gemSurvivalEstimate: number, retailValue: number): CoinData['rarity'] {
  if (retailValue >= 1000000 || gemSurvivalEstimate <= 5) {
    return 'legendary';
  } else if (retailValue >= 100000 || gemSurvivalEstimate <= 100) {
    return 'rare';
  } else {
    return 'scarce';
  }
}

// Helper to format currency
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
} 