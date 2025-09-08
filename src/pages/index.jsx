import Layout from "./Layout.jsx";

import Home from "./Home";

import ChargerDetails from "./ChargerDetails";

import AddCharger from "./AddCharger";

import HostDashboard from "./HostDashboard";

import DriverDashboard from "./DriverDashboard";

import MyChargers from "./MyChargers";

import Messages from "./Messages";

import AccountSettings from "./AccountSettings";

import HostReservations from "./HostReservations";

import DriverProfile from "./DriverProfile";

import HostProfile from "./HostProfile";

import Onboarding from "./Onboarding";

import InvoiceDetails from "./InvoiceDetails";

import PrivacyPolicy from "./PrivacyPolicy";

import TermsOfService from "./TermsOfService";

import LegalNotice from "./LegalNotice";

import DriverCSU from "./DriverCSU";

import HostCSU from "./HostCSU";

import CookiesPolicy from "./CookiesPolicy";

import ConfigureCookies from "./ConfigureCookies";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    ChargerDetails: ChargerDetails,
    
    AddCharger: AddCharger,
    
    HostDashboard: HostDashboard,
    
    DriverDashboard: DriverDashboard,
    
    MyChargers: MyChargers,
    
    Messages: Messages,
    
    AccountSettings: AccountSettings,
    
    HostReservations: HostReservations,
    
    DriverProfile: DriverProfile,
    
    HostProfile: HostProfile,
    
    Onboarding: Onboarding,
    
    InvoiceDetails: InvoiceDetails,
    
    PrivacyPolicy: PrivacyPolicy,
    
    TermsOfService: TermsOfService,
    
    LegalNotice: LegalNotice,
    
    DriverCSU: DriverCSU,
    
    HostCSU: HostCSU,
    
    CookiesPolicy: CookiesPolicy,
    
    ConfigureCookies: ConfigureCookies,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/ChargerDetails" element={<ChargerDetails />} />
                
                <Route path="/AddCharger" element={<AddCharger />} />
                
                <Route path="/HostDashboard" element={<HostDashboard />} />
                
                <Route path="/DriverDashboard" element={<DriverDashboard />} />
                
                <Route path="/MyChargers" element={<MyChargers />} />
                
                <Route path="/Messages" element={<Messages />} />
                
                <Route path="/AccountSettings" element={<AccountSettings />} />
                
                <Route path="/HostReservations" element={<HostReservations />} />
                
                <Route path="/DriverProfile" element={<DriverProfile />} />
                
                <Route path="/HostProfile" element={<HostProfile />} />
                
                <Route path="/Onboarding" element={<Onboarding />} />
                
                <Route path="/InvoiceDetails" element={<InvoiceDetails />} />
                
                <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
                
                <Route path="/TermsOfService" element={<TermsOfService />} />
                
                <Route path="/LegalNotice" element={<LegalNotice />} />
                
                <Route path="/DriverCSU" element={<DriverCSU />} />
                
                <Route path="/HostCSU" element={<HostCSU />} />
                
                <Route path="/CookiesPolicy" element={<CookiesPolicy />} />
                
                <Route path="/ConfigureCookies" element={<ConfigureCookies />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}