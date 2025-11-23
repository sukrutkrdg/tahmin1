import { TokenType } from './token';

// Diğer dosyalarda 'TokenType' buradan çağırıldığı için dışa aktarıyoruz
export { TokenType };

export enum Asset {
  btc = 'BTC',
  eth = 'ETH',
  xrp = 'XRP',
}

export enum PredictionDirection {
  above = 'up',
  below = 'down',
}

export enum TimeInterval {
  oneHour = '1h',
  fourHours = '4h',
  twentyFourHours = '24h',
}