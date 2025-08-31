import React from 'react';
import { ChevronRight } from 'lucide-react';

const CheckoutBreadcrumbs = ({ currentStep }) => {
  const steps = ['information', 'shipping', 'payment'];
  const stepIndex = steps.indexOf(currentStep);

  return (
    <nav className="flex items-center text-sm text-gray-500 mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <span
            className={`${
              index === stepIndex ? 'text-gray-900 font-semibold' : ''
            } capitalize`}
          >
            {step}
          </span>
          {index < steps.length - 1 && (
            <ChevronRight className="h-4 w-4 mx-2" />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default CheckoutBreadcrumbs;
