import { 
  CheckCircle, 
  Clock, 
  Handshake, 
  User 
} from "lucide-react";

// Label types
export type LabelType = 
  | 'payment_done' 
  | 'processing' 
  | 'deal_done' 
  | 'regular_customer' 
  | null;

// Label definitions with display text and icon
export const LABELS = {
  payment_done: {
    id: 'payment_done',
    text: 'Payment Done',
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-100'
  },
  processing: {
    id: 'processing',
    text: 'Processing',
    icon: Clock,
    color: 'text-amber-500',
    bgColor: 'bg-amber-100'
  },
  deal_done: {
    id: 'deal_done',
    text: 'Deal Done',
    icon: Handshake,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100'
  },
  regular_customer: {
    id: 'regular_customer',
    text: 'Regular Customer',
    icon: User,
    color: 'text-purple-500',
    bgColor: 'bg-purple-100'
  }
};

// Get label info by ID
export const getLabelInfo = (labelId: LabelType) => {
  if (!labelId) return null;
  return LABELS[labelId];
};
