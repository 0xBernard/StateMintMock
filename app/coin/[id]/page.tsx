import { coins } from '@/lib/data/coins';
import { CoinPageContent } from './coin-page-content';

export async function generateStaticParams() {
  return coins.map((coin) => ({
    id: coin.id,
  }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CoinPage({ params }: PageProps) {
  const { id } = await params;
  return <CoinPageContent id={id} />;
} 