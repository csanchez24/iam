import {
  ActivityLogIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  AvatarIcon,
  BackpackIcon,
  CalendarIcon,
  CaretSortIcon,
  CheckCircledIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleBackslashIcon,
  CircleIcon,
  ClockIcon,
  CopyIcon,
  Cross2Icon,
  CrossCircledIcon,
  DotsHorizontalIcon,
  ExclamationTriangleIcon,
  EyeClosedIcon,
  EyeNoneIcon,
  EyeOpenIcon,
  FileIcon,
  FileTextIcon,
  GearIcon,
  HamburgerMenuIcon,
  HomeIcon,
  LaptopIcon,
  LockClosedIcon,
  LockOpen1Icon,
  MinusCircledIcon,
  MoonIcon,
  Pencil2Icon,
  PersonIcon,
  PlusCircledIcon,
  PlusIcon,
  ReaderIcon,
  RocketIcon,
  RulerSquareIcon,
  SunIcon,
  TrashIcon,
  UploadIcon,
} from '@radix-ui/react-icons';
import {
  BabyIcon,
  BanknoteIcon,
  Building2Icon,
  CalendarClockIcon,
  FingerprintIcon,
  GraduationCapIcon,
  LayoutListIcon,
  LineChart,
  NewspaperIcon,
  PackageOpenIcon,
  SearchIcon,
  ShieldCheckIcon,
  UsersRoundIcon,
} from 'lucide-react';

export type IconProps = React.SVGAttributes<SVGElement> & {
  children?: never;
  color?: string;
};

export const Icons = {
  Fingerprint: FingerprintIcon,
  Shield: ShieldCheckIcon,
  EyeOpen: EyeOpenIcon,
  EyeClosed: EyeClosedIcon,
  EyeNone: EyeNoneIcon,
  CircleBackslash: CircleBackslashIcon,
  PackageOpen: PackageOpenIcon,
  Search: SearchIcon,
  Ruler: RulerSquareIcon,
  Clock: ClockIcon,
  LineChart: LineChart,
  Newspaper: NewspaperIcon,
  GraduationCap: GraduationCapIcon,
  Tasks: LayoutListIcon,
  Banknote: BanknoteIcon,
  Building: Building2Icon,
  Baby: BabyIcon,
  Users: UsersRoundIcon,
  User: PersonIcon,
  Upload: UploadIcon,
  DotsHorizontal: DotsHorizontalIcon,
  Trash: TrashIcon,
  Edit: Pencil2Icon,
  RemoveList: CrossCircledIcon,
  Circle: CircleIcon,
  CheckCircle: CheckCircledIcon,
  AddCircle: PlusCircledIcon,
  Add: PlusIcon,
  RemoveCircle: MinusCircledIcon,
  Close: Cross2Icon,
  Check: CheckIcon,
  ChevronLeft: ChevronLeftIcon,
  ChevronRight: ChevronRightIcon,
  ChevronDown: ChevronDownIcon,
  ChevronsUpDown: CaretSortIcon,
  ArrowRight: ArrowRightIcon,
  ArrowDown: ArrowDownIcon,
  Warning: ExclamationTriangleIcon,
  Sun: SunIcon,
  Moon: MoonIcon,
  Laptop: LaptopIcon,
  Copy: CopyIcon,
  CopyDone: CheckIcon,
  Menu: HamburgerMenuIcon,
  Gear: GearIcon,
  Home: HomeIcon,
  Avatar: AvatarIcon,
  ActivityLog: ActivityLogIcon,
  CalendarClock: CalendarClockIcon,
  Calendar: CalendarIcon,
  LockOpen: LockOpen1Icon,
  Backpack: BackpackIcon,
  ArrowLeft: ArrowLeftIcon,
  FileText: FileTextIcon,
  File: FileIcon,
  Person: PersonIcon,
  Reader: ReaderIcon,
  Rocket: RocketIcon,
  CaretSort: CaretSortIcon,
  LockClosed: LockClosedIcon,
  // Radix does not have a loading icon
  Spinner: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  ),
};
