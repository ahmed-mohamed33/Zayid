import './index.css';
import SelectCategoryPage from './selectCategory/page/SelectCategoryPage.jsx';
import StartStep from './selectCategory/page/start.jsx';
import StepOverview from './selectCategory/page/StepOverview.jsx';
import SignUp from './signUp/page/SignUp.jsx';
import { Routes, Route } from 'react-router-dom';
import TermsAndConditions from './TermsAndConditions/TermsAndConditions.jsx';
import ContactUs from './ContactUs/ContactUs.jsx';

export default function App() {
  return (
    <>
      <ContactUs />
      {/* <TermsAndConditions /> */}
      {/* <Routes>
        <Route path="/selectCategory" element={<SelectCategoryPage />} />
        <Route path="/overview" element={<StepOverview />} />
        <Route path="/start" element={<StartStep />} />
      </Routes> */}
      {/* <SignUp /> */}
    </>
  );
}
