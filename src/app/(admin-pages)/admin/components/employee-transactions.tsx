// spell-checker:disabled // TODO: remove
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const CrewTransactions = () => (
  <div className="space-y-8">
    <div className="flex items-center">
      <Avatar className="h-9 w-9">
        <AvatarImage src="/avatars/01.png" alt="Avatar" />
        <AvatarFallback>CD</AvatarFallback>
      </Avatar>
      <div className="ml-4 space-y-1">
        <p className="text-sm font-medium leading-none">Clifford Domingo</p>
        <p className="text-sm text-muted-foreground">Detailer</p>
      </div>
      <div className="ml-auto font-medium">12</div>
    </div>
    <div className="flex items-center">
      <Avatar className="flex h-9 w-9 items-center justify-center space-y-0 border">
        <AvatarImage src="/avatars/02.png" alt="Avatar" />
        <AvatarFallback>JM</AvatarFallback>
      </Avatar>
      <div className="ml-4 space-y-1">
        <p className="text-sm font-medium leading-none">JM</p>
        <p className="text-sm text-muted-foreground">Crew</p>
      </div>
      <div className="ml-auto font-medium">13</div>
    </div>
    <div className="flex items-center">
      <Avatar className="h-9 w-9">
        <AvatarImage src="/avatars/03.png" alt="Avatar" />
        <AvatarFallback>IN</AvatarFallback>
      </Avatar>
      <div className="ml-4 space-y-1">
        <p className="text-sm font-medium leading-none">Isabella Nguyen</p>
        <p className="text-sm text-muted-foreground">Crew</p>
      </div>
      <div className="ml-auto font-medium">9</div>
    </div>
    <div className="flex items-center">
      <Avatar className="h-9 w-9">
        <AvatarImage src="/avatars/04.png" alt="Avatar" />
        <AvatarFallback>WK</AvatarFallback>
      </Avatar>
      <div className="ml-4 space-y-1">
        <p className="text-sm font-medium leading-none">William Kim</p>
        <p className="text-sm text-muted-foreground">Crew</p>
      </div>
      <div className="ml-auto font-medium">10</div>
    </div>
    <div className="flex items-center">
      <Avatar className="h-9 w-9">
        <AvatarImage src="/avatars/05.png" alt="Avatar" />
        <AvatarFallback>SD</AvatarFallback>
      </Avatar>
      <div className="ml-4 space-y-1">
        <p className="text-sm font-medium leading-none">Sofia Davis</p>
        <p className="text-sm text-muted-foreground">Crew</p>
      </div>
      <div className="ml-auto font-medium">4</div>
    </div>
  </div>
);

export default CrewTransactions;
