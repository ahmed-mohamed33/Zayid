import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import SelectCategory from "../components/onboarding/SelectCategory";
import StepOverview from "../components/onboarding/StepOverview";
import Start from "../components/onboarding/Start";
import ProgressSteps from "../components/onboarding/ProgressSteps";
import { UserContext } from "../context/UserContext";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1); // Start from step 1 (select categories)
  const [selectedCategories, setSelectedCategories] = useState([]);
  const userContext = useContext(UserContext);
  const { updateUserData, userData } = userContext;

  const handleSelectCategoryNext = async () => {
    // Update user data with selected categories
    if (selectedCategories.length > 0) {
      try {
        const result = await updateUserData({
          userInterests: selectedCategories, // Changed to match the filtering key
          onboardingCompleted: false,
        });

        if (result.success) {
          } else {
          }
      } catch (error) {
        }
    }

    setCurrentStep(2); // Move to overview step
  };

  const handleStepOverviewNext = () => {
    setCurrentStep(3); // Move to Start step
  };

  const handleFinish = async () => {
    try {
      const result = await updateUserData({
        onboardingCompleted: true,
      });

      if (result.success) {
        } else {
        }
    } catch (error) {
      }

    navigate("/");
  };

  if (!userData) return null;

  if (userData.onboardingCompleted) {
    // Redirect to home if onboarding is already completed
    navigate("/");
    return null;
  }
  return (
    <div
      style={{ padding: "91px 96px" }}
      className={`bg-[#F1F1F1] ${
        currentStep === 3 ? "flex flex-col justify-between min-h-screen" : ""
      }`}
    >
      <div>
        <ProgressSteps currentStep={currentStep} />

        {currentStep === 1 && (
          <SelectCategory
            onNext={handleSelectCategoryNext}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
          />
        )}

        {currentStep === 2 && <StepOverview onNext={handleStepOverviewNext} />}

        {currentStep === 3 && <Start onFinish={handleFinish} />}
      </div>
    </div>
  );
}

