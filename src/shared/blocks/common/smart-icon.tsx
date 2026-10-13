import type { ComponentType } from 'react';
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  Ban,
  BookOpen,
  Brain,
  ChartBar,
  Clapperboard,
  Clock3,
  Code2,
  Coins,
  CreditCard,
  DollarSign,
  FileText,
  Folder,
  Github,
  HelpCircle,
  History,
  Home,
  Images,
  Key,
  LayoutDashboard,
  Mail,
  Megaphone,
  Menu,
  MessageCircle,
  MessageSquare,
  Monitor,
  Newspaper,
  Pencil,
  Plus,
  ReceiptText,
  Search,
  Settings,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';
import { GoArrowUpRight } from 'react-icons/go';
import {
  RiAddLine,
  RiBankCardLine,
  RiChat2Line,
  RiDeleteBinLine,
  RiDiscordFill,
  RiEditLine,
  RiEyeLine,
  RiFlashlightFill,
  RiHistoryLine,
  RiHomeLine,
  RiKeyLine,
  RiLockPasswordLine,
  RiMailLine,
  RiMoneyDollarBoxLine,
  RiMoneyDollarCircleLine,
  RiOrderPlayLine,
  RiRefreshLine,
  RiTaskLine,
  RiTwitterXFill,
  RiUserLine,
  RiVideoLine,
} from 'react-icons/ri';

type IconComponent = ComponentType<{
  size?: number;
  className?: string;
}>;

const iconMap: Record<string, IconComponent> = {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  Ban,
  BookOpen,
  Brain,
  ChartBar,
  Clapperboard,
  Clock3,
  Code2,
  Coins,
  CreditCard,
  DollarSign,
  FileText,
  Folder,
  Github,
  History,
  Home,
  Images,
  Key,
  LayoutDashboard,
  Mail,
  Megaphone,
  Menu,
  MessageCircle,
  MessageSquare,
  Newspaper,
  Pencil,
  Plus,
  ReceiptText,
  Search,
  Settings,
  ShieldCheck,
  User,
  Users,
  Monitor,
  GoArrowUpRight,
  RiAddLine,
  RiBankCardLine,
  RiChat2Line,
  RiDeleteBinLine,
  RiDiscordFill,
  RiEditLine,
  RiEyeLine,
  RiFlashlightFill,
  RiHistoryLine,
  RiHomeLine,
  RiKeyLine,
  RiLockPasswordLine,
  RiMailLine,
  RiMoneyDollarBoxLine,
  RiMoneyDollarCircleLine,
  RiOrderPlayLine,
  RiRefreshLine,
  RiTaskLine,
  RiTwitterXFill,
  RiUserLine,
  RiVideoLine,
};

function EmptyIcon({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={className}
      style={{ display: 'inline-block', width: size, height: size }}
    />
  );
}

export function SmartIcon({
  name,
  size = 24,
  className,
  ...props
}: {
  name: string;
  size?: number;
  className?: string;
  [key: string]: any;
}) {
  if (!name) {
    return <EmptyIcon size={size} className={className} />;
  }

  const IconComponent = iconMap[name] ?? HelpCircle;

  if (process.env.NODE_ENV !== 'production' && !iconMap[name]) {
    console.warn(
      `Icon "${name}" is not registered in SmartIcon; using fallback`
    );
  }

  return <IconComponent size={size} className={className} {...props} />;
}
