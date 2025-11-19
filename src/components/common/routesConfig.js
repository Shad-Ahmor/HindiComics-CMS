/* routesConfig.js */
import CMSDashboard from "../CMSDashboard";
import Comics from "../comics/Comics";
import ContentManager from "../contents/ContentManager";
import ReferralDashboard from "../marketting/Referal";
import CouponPage from "../management/CouponPage";
import UserLogs from "../management/UserLogs";
import SuggestionsPage from "../marketting/SuggestionsPage";

export const routesConfig = [
{ name: "Dashboard", path: "/cms/dashboard", component: CMSDashboard },
{ name: "Comics", path: "/cms/comics", component: Comics },
{ name: "Contents", path: "/cms/content", component: ContentManager },
{ name: "Coupons", path: "/cms/coupons", component: CouponPage },
{ name: "Referrals", path: "/cms/referral", component: ReferralDashboard },
{ name: "User Logs", path: "/cms/userlogs", component: UserLogs },
{ name: "Suggestions", path: "/cms/suggestions", component: SuggestionsPage },
];
