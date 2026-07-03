import {
  CheckCircle2,
  XCircle,
  CreditCard,
  Wallet,
  RotateCcw,
  AlertTriangle,
  UserCheck,
  Archive,
  Building2,
  Bell,
} from "lucide-react";
import { NotificationType } from "@/lib/api";

export function NotificationIcon({ type }: { type: NotificationType }) {
  let Icon = Bell;
  let colorClass = "text-[#F7F7F7]/40";

  switch (type) {
    case "BOOKING_CONFIRMED":
      Icon = CheckCircle2;
      colorClass = "text-[#50C8C8]";
      break;
    case "BOOKING_CANCELLED":
      Icon = XCircle;
      colorClass = "text-red-400";
      break;
    case "PAYMENT_SUCCESS":
      Icon = CreditCard;
      colorClass = "text-[#E6FA50]";
      break;
    case "PAYMENT_FAILED":
      Icon = CreditCard;
      colorClass = "text-red-400";
      break;
    case "BALANCE_DUE":
      Icon = Wallet;
      colorClass = "text-[#E6FA50]";
      break;
    case "REFUND_REQUESTED":
      Icon = RotateCcw;
      colorClass = "text-[#50C8C8]";
      break;
    case "REFUND_APPROVED":
      Icon = CheckCircle2;
      colorClass = "text-[#50C8C8]";
      break;
    case "REFUND_REJECTED":
      Icon = XCircle;
      colorClass = "text-red-400";
      break;
    case "REFUND_PROCESSED":
      Icon = Wallet;
      colorClass = "text-[#50C8C8]";
      break;
    case "DISPUTE_CREATED":
      Icon = AlertTriangle;
      colorClass = "text-amber-400";
      break;
    case "DISPUTE_ASSIGNED":
      Icon = UserCheck;
      colorClass = "text-[#50C8C8]";
      break;
    case "DISPUTE_RESOLVED":
      Icon = CheckCircle2;
      colorClass = "text-[#50C8C8]";
      break;
    case "DISPUTE_CLOSED":
      Icon = Archive;
      colorClass = "text-[#F7F7F7]/40";
      break;
    case "VENUE_SUBMITTED":
      Icon = Building2;
      colorClass = "text-[#E6FA50]";
      break;
    default:
      Icon = Bell;
      colorClass = "text-[#F7F7F7]/40";
      break;
  }

  return (
    <div className="shrink-0 h-9 w-9 rounded-full grid place-items-center bg-white/[0.03]">
      <Icon className={`h-4 w-4 ${colorClass}`} />
    </div>
  );
}
