import React from 'react';
import {
  Wallet,
  Utensils,
  ShoppingCart,
  Car,
  ShoppingBag,
  Receipt,
  Dumbbell,
  Activity,
  Flame,
  Footprints,
  HeartPulse,
  Smartphone,
  Share2,
  PlayCircle,
  CheckCircle2,
  Gamepad2,
  Briefcase,
  Code,
  Users,
  Mail,
  Landmark,
  CreditCard,
  Home,
  Target,
  Send,
  PhoneCall,
  Code2,
  Trophy,
  Zap,
  BookOpen,
  Music,
  Smile,
  Layers,
  Heart,
  Star,
  Check
} from 'lucide-react';

const ICON_MAP = {
  wallet: Wallet,
  utensils: Utensils,
  shoppingcart: ShoppingCart,
  car: Car,
  shoppingbag: ShoppingBag,
  receipt: Receipt,
  dumbbell: Dumbbell,
  activity: Activity,
  flame: Flame,
  footprints: Footprints,
  heartpulse: HeartPulse,
  smartphone: Smartphone,
  share2: Share2,
  playcircle: PlayCircle,
  checkcircle2: CheckCircle2,
  gamepad2: Gamepad2,
  briefcase: Briefcase,
  code: Code,
  users: Users,
  mail: Mail,
  landmark: Landmark,
  creditcard: CreditCard,
  home: Home,
  target: Target,
  send: Send,
  phonecall: PhoneCall,
  code2: Code2,
  trophy: Trophy,
  zap: Zap,
  bookopen: BookOpen,
  music: Music,
  smile: Smile,
  layers: Layers,
  heart: Heart,
  star: Star,
  check: Check
};

const CATEGORY_DEFAULT_ICONS = {
  FINANCE: Wallet,
  LOANS: Landmark,
  WORKOUT: Dumbbell,
  WORK_TIME: Briefcase,
  CAREER: Target,
  SCREEN_TIME: Smartphone,
  CUSTOM: Zap
};

const CATEGORY_DEFAULT_EMOJIS = {
  FINANCE: '💰',
  LOANS: '🏦',
  WORKOUT: '🏋️',
  WORK_TIME: '💼',
  CAREER: '🎯',
  SCREEN_TIME: '📱',
  CUSTOM: '⚡'
};

export function getActivityEmoji(icon, categoryType) {
  if (!icon) return CATEGORY_DEFAULT_EMOJIS[categoryType] || '📌';
  const clean = String(icon).trim();
  if (/\p{Extended_Pictographic}/u.test(clean) || clean.length <= 2) {
    return clean;
  }
  const key = clean.toLowerCase();
  switch (key) {
    case 'wallet': return '💰';
    case 'utensils': return '🍽️';
    case 'shoppingcart': return '🛒';
    case 'car': return '🚗';
    case 'shoppingbag': return '🛍️';
    case 'receipt': return '🧾';
    case 'dumbbell': return '🏋️';
    case 'activity': return '📈';
    case 'flame': return '🔥';
    case 'footprints': return '👣';
    case 'heartpulse': return '💓';
    case 'smartphone': return '📱';
    case 'share2': return '🔗';
    case 'playcircle': return '▶️';
    case 'checkcircle2': return '✅';
    case 'gamepad2': return '🎮';
    case 'briefcase': return '💼';
    case 'code': case 'code2': return '💻';
    case 'users': return '👥';
    case 'mail': return '✉️';
    case 'landmark': return '🏦';
    case 'creditcard': return '💳';
    case 'home': return '🏠';
    case 'target': return '🎯';
    case 'send': return '🚀';
    case 'phonecall': return '📞';
    case 'trophy': return '🏆';
    default: return CATEGORY_DEFAULT_EMOJIS[categoryType] || '📌';
  }
}

export default function ActivityIcon({ icon, categoryType, className = "w-5 h-5", fallback = "⚡" }) {
  if (!icon) {
    const CatDefault = CATEGORY_DEFAULT_ICONS[categoryType];
    if (CatDefault) {
      return <CatDefault className={className} />;
    }
    return <span className={className}>{fallback}</span>;
  }

  const clean = String(icon).trim();

  // If it's an emoji (e.g. 🎯, 📚, 💻, etc.)
  if (/\p{Extended_Pictographic}/u.test(clean) || clean.length <= 2) {
    return <span className={`inline-flex items-center justify-center leading-none ${className}`}>{clean}</span>;
  }

  // Check icon map
  const LucideComp = ICON_MAP[clean.toLowerCase()];
  if (LucideComp) {
    return <LucideComp className={className} />;
  }

  // Check category default
  const CatDefault = CATEGORY_DEFAULT_ICONS[categoryType];
  if (CatDefault) {
    return <CatDefault className={className} />;
  }

  return <span className={`inline-flex items-center justify-center leading-none ${className}`}>{fallback}</span>;
}
