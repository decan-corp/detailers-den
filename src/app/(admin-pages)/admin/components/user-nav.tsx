import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { validateRequest } from 'src/components/auth/validate-request';
import LogoutButton from 'src/components/button/logout';
import ThemeModeToggle from 'src/components/toggle/theme-mode-toggle';
import { AdminRoute } from 'src/constants/routes';
import { getInitials } from 'src/utils/formatters';

import Link from 'next/link';

const UserNav = async () => {
  const { user } = await validateRequest();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full outline-none">
          <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
            <AvatarImage src={user?.image || ''} alt="@shadcn" />
            <AvatarFallback className="select-none text-xs sm:text-sm">
              {getInitials(user?.name || 'UN')}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.role}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer">Profile</DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" asChild>
            <Link href={AdminRoute.Settings}>Settings</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <div className="flex place-content-between items-center p-2">
            <span className="text-sm">Theme</span>
            <ThemeModeToggle />
          </div>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer p-0">
          <LogoutButton className="px-2 py-1.5" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserNav;
