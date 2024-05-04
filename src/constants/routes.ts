export enum Route {
  Home = '/',
  Pricing = '/pricing',
  Services = '/services',
  Promos = '/promos',
  Faq = '/faq',
  AboutUs = '/about-us',
}

export enum AdminRoute {
  Login = '/auth/login',
  Logout = '/logout',
  ResetPassword = '/auth/reset-password',
  ForgotPassword = '/auth/forgot-password',
  Dashboard = '/admin',
  POS = '/admin/pos',
  Settings = '/admin/settings',
  ChangePassword = '/admin/settings/change-password',
  ManageUsers = '/admin/manage',
  ManageServices = '/admin/manage/services',
  ManagePromo = '/admin/manage/Promo',
  AddTransaction = '/admin/pos/add',
  EditTransaction = '/admin/pos/edit',
  AccountSetup = '/account-setup',
}
