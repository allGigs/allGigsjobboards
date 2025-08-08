"use client"

import React, { useState, useEffect } from 'react';
import { supabase } from "../SupabaseClient";
import CompleteProfileForm from "../components/ui/CompleteProfileForm";
import { useProfileCheck } from "../components/ui/useProfileCheck";
import {
    Search,
    Info,
} from 'lucide-react';

// Automation Details Interface
interface AutomationDetails {
    id: number;
    Company_name: string;
    Task_ID?: string;
    "Parent company"?: string;
    "Has permanent partner"?: boolean;
    "does not work with allgigs?"?: boolean;
    API?: string;
    URL?: string;
    "paid/free"?: string;
    payment?: string;
    "pay to access"?: string;
    "Pay to reply"?: string;
    subscription?: string;
    "subscription price/ month"?: number;
    "transaction fees"?: number;
    "transaction %"?: number;
    percentage?: number;
    "percentage fee"?: number;
    "Hourly rate"?: number;
    "Fixed price"?: number;
    "paid by employer"?: boolean;
    "Company description"?: string;
    government?: boolean;
    "private company"?: boolean;
    "semi government"?: boolean;
    "job board"?: boolean;
    "recruitment company"?: boolean;
    "recruitment tech"?: boolean;
    broker?: boolean;
    "procurement tool"?: boolean;
    "End customer"?: boolean | string;
    "Dutch Only"?: boolean;
    "Pricing info found?"?: boolean | string;
}

// Company Card Component
const CompanyCard: React.FC<{
    company: AutomationDetails;
    onClick: () => void;
    isSelected: boolean;
    onSelectionChange: (companyId: number, selected: boolean) => void;
}> = ({ company, onClick, isSelected, onSelectionChange }) => {
    const capitalizeFirstLetter = (str: string) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    return (
        <div
            onClick={onClick}
            className="company-card"
        >
            {/* Company Name */}
            <div className="company-name-container">
                <div className="company-name-content">
                <h3 className="company-name">
                        {capitalizeFirstLetter(company.Company_name)}
                </h3>
                    <div className="company-subtitle">
                        <span className="subtitle-label">Pricing info:</span>
                        <span className="subtitle-value">
                            {company["Pricing info found?"] === true || company["Pricing info found?"] === 'yes' || company["Pricing info found?"] === 'Yes' ? 'Yes' : 
                             company["Pricing info found?"] === false || company["Pricing info found?"] === 'no' || company["Pricing info found?"] === 'No' ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    No
                                    <div className="info-tooltip-container">
                                        <Info size={14} className="info-icon" />
                                        <div className="info-tooltip">
                                            We could not find any information regarding the pricing, we therefore guess based on experience. The information might be wrong.
            </div>
                        </div>
                                </span>
                             ) : (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    {company["Pricing info found?"] ? company["Pricing info found?"].toString() : 'Not specified'}
                                    <div className="info-tooltip-container">
                                        <Info size={14} className="info-icon" />
                                        <div className="info-tooltip">
                                            We could not find any information regarding the pricing, we therefore guess based on experience. The information might be wrong.
                        </div>
                </div>
                        </span>
                             )}
                        </span>
                    </div>
                </div>
            </div>

            {/* Selection Checkbox */}
            <div className="company-selection-box" onClick={(e) => e.stopPropagation()}>
                <input 
                    type="checkbox" 
                    className="company-checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                        e.stopPropagation();
                        onSelectionChange(company.id, e.target.checked);
                    }}
                    onClick={(e) => e.stopPropagation()}
                />
            </div>

            {/* Company Description */}
            {company["Company description"] && (
                <div className="company-description-section">
                    <div className="description-label">Description</div>
                    <div className={`company-description ${!isDescriptionExpanded ? 'description-truncated' : ''}`}>
                        {company["Company description"]}
                    </div>
                    <button
                        className="expand-description-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsDescriptionExpanded(!isDescriptionExpanded);
                        }}
                    >
                        {isDescriptionExpanded ? 'Show less' : 'Show more'}
                    </button>
                </div>
            )}

            {/* Payment Information */}
            <div className="company-charges">
                <div className="charges-title">Payment Information:</div>
                <div className="charges-list">
                    {company["Pay to reply"] && (
                        <div className="charge-item">
                            <span className="charge-label">Pay to Reply:</span>
                            <span className="charge-value">{company["Pay to reply"]}</span>
                        </div>
                    )}
                    {company["pay to access"] && (
                        <div className="charge-item">
                            <span className="charge-label">Pay to Access:</span>
                            <span className="charge-value">{company["pay to access"]}</span>
                        </div>
                    )}
                    <div className="charge-item">
                        <span className="charge-label">Paid/Free:</span>
                        <span className="charge-value">{company["paid/free"] || "Not specified"}</span>
                    </div>
                </div>
            </div>

            {/* Company Charges */}
            <div className="company-charges">
                <div className="charges-title">Cost:</div>
                <div className="charges-list">
                    {(() => {
                        const hasSubscriptionFee = company["subscription price/ month"] !== undefined && company["subscription price/ month"] !== null && company["subscription price/ month"] > 0;
                        const hasTransactionFee = typeof company["transaction fees"] === 'number' && company["transaction fees"] > 0;
                        const hasTransactionPercent = company["transaction %"] !== undefined && company["transaction %"] !== null && company["transaction %"] > 0;
                        const hasPercentageFee = company["percentage fee"] !== undefined && company["percentage fee"] !== null && company["percentage fee"] > 0;
                        const hasHourlyRate = company["Hourly rate"] !== undefined && company["Hourly rate"] !== null && company["Hourly rate"] > 0;
                        
                        const hasAnyCosts = hasSubscriptionFee || hasTransactionFee || hasTransactionPercent || hasPercentageFee || hasHourlyRate;
                        
                        if (!hasAnyCosts) {
                            return (
                                <div className="charge-item">
                                    <span className="charge-value">Free</span>
                                </div>
                            );
                        }
                        
                        return (
                            <>
                                {hasSubscriptionFee && (
                                    <div className="charge-item">
                                        <span className="charge-label">Subscription fees:</span>
                                        <span className="charge-value">€{company["subscription price/ month"]}/month</span>
                                    </div>
                                )}
                                {hasTransactionFee && (
                                    <div className="charge-item">
                                        <span className="charge-label">Transaction fees:</span>
                                        <span className="charge-value">€{company["transaction fees"]}</span>
                                    </div>
                                )}
                                {hasTransactionPercent && (
                                    <div className="charge-item">
                                        <span className="charge-label">Transaction fees:</span>
                                        <span className="charge-value">{company["transaction %"]}%</span>
                                    </div>
                                )}
                                {hasPercentageFee && (
                                    <div className="charge-item">
                                        <span className="charge-label">Percentage fees:</span>
                                        <span className="charge-value">{company["percentage fee"]}%</span>
                                    </div>
                                )}
                                {hasHourlyRate && (
                                    <div className="charge-item">
                                        <span className="charge-label">Hourly rate:</span>
                                        <span className="charge-value">€{company["Hourly rate"]}/hour</span>
                                    </div>
                                )}
                            </>
                        );
                    })()}
                </div>
            </div>

            {/* Customers Title */}
                <div className="customers-title">
                    Customers
                </div>

            {/* Company Categories */}
            <div className="company-categories">
                {company["End customer"] && company["End customer"] !== "no" && (
                    <span className="category-badge category-end-customer">
                        End Customer
                    </span>
                )}
                {company["semi government"] && (
                    <span className="category-badge category-semi-gov">
                        Semi-Gov
                    </span>
                )}
                {company.government && (
                    <span className="category-badge category-government">
                        Government
                    </span>
                )}
            </div>

            {/* Visit Website Button */}
            {company.URL && (
                <div className="website-button-container">
                    <button
                        className="website-button"
                        onClick={(e) => {
                            e.stopPropagation();
                            let url = company.URL;
                            // Ensure URL has protocol
                            if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
                                url = 'https://' + url;
                            }
                            window.open(url, '_blank');
                        }}
                    >
                        Visit Website
                    </button>
                </div>
            )}

            {/* Hover indicator */}
            <div className="hover-indicator">
                Click for details →
            </div>
        </div>
    );
};

// Company Detail Modal Component
const CompanyDetailModal: React.FC<{
    company: AutomationDetails;
    companies: AutomationDetails[];
    onClose: () => void;
    calculatorHours: number;
    calculatorWeeksPerMonth: number;
    calculatorMonthlyTotal: number;
    calculatorTotalWithTax: number;
}> = ({ company, companies, onClose, calculatorHours, calculatorWeeksPerMonth, calculatorMonthlyTotal, calculatorTotalWithTax }) => {
    const getCompanyTypes = () => {
        const types = [];
        if (company["job board"]) types.push({ label: 'Job Board', color: 'modal-badge-job-board' });
        if (company["recruitment company"]) types.push({ label: 'Recruitment Company', color: 'modal-badge-recruitment' });
        if (company["recruitment tech"]) types.push({ label: 'Recruitment Tech', color: 'modal-badge-tech' });
        if (company.broker) types.push({ label: 'Broker', color: 'modal-badge-broker' });
        if (company["procurement tool"]) types.push({ label: 'Procurement Tool', color: 'modal-badge-procurement' });
        if (company["End customer"] !== false && company["End customer"] !== "no") types.push({ label: 'End Customer', color: 'modal-badge-customer' });
        return types;
    };

    const companyTypes = getCompanyTypes();

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-body">
                    <div className="modal-header">
                        <div>
                            <h2 className="modal-title">
                                {company.Company_name.charAt(0).toUpperCase() + company.Company_name.slice(1).toLowerCase()}
                            </h2>
                            {company["Parent company"] && (
                                <p className="modal-subtitle">Parent: {company["Parent company"]}</p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="modal-close-button"
                        >
                            ×
                        </button>
                    </div>

                    {company["Company description"] && (
                        <div className="modal-section">
                            <h3 className="modal-section-title">Description</h3>
                            <p className="company-description-modal">
                                {company["Company description"]}
                            </p>
                        </div>
                    )}

                    <div className="modal-section" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                        {companyTypes.length > 0 && (
                            <div style={{ flex: 1 }}>
                            <h3 className="modal-section-title">Business Model</h3>
                            <div className="modal-badges">
                                {companyTypes.map((type, index) => (
                                        <span key={index} className={`modal-badge ${type.color}`}>
                                        {type.label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                        {((company["subscription price/ month"] !== null && company["subscription price/ month"] !== undefined) || company["Hourly rate"]) && (
                            <div style={{ flex: 1 }}>
                                <h3 className="modal-section-title">Cost Analysis</h3>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <div className="cost-chart">
                                        {(() => {
                                                                                    const currentDate = new Date();
                                        const subscriptionCost = company["subscription price/ month"] || 0;
                                        const hourlyRate = company["Hourly rate"] || 0;
                                        const monthlyHourlyCost = hourlyRate * calculatorHours * calculatorWeeksPerMonth;
                                        const percentageFee = company["percentage fee"] || 0;
                                        const monthlyPercentageCost = calculatorMonthlyTotal * (percentageFee / 100);
                                        const totalPercentageCost = calculatorTotalWithTax * (percentageFee / 100);
                                        const maxCost = Math.max(subscriptionCost, monthlyHourlyCost, monthlyPercentageCost) * 3 || 1;

                                            const subscriptionData = [1, 2, 3].map((month, index) => {
                                                const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + index, 1);
                                                const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' });
                                                const cumulativeCost = subscriptionCost * month;
                                                return {
                                                    month: monthName,
                                                    cost: cumulativeCost,
                                                    x: (index / 2) * 100,
                                                    y: 100 - (cumulativeCost / maxCost) * 100
                                                };
                                            });

                                            const hourlyData = [1, 2, 3].map((month, index) => {
                                                const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + index, 1);
                                                const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' });
                                                const cumulativeCost = monthlyHourlyCost * month;
                                                return {
                                                    month: monthName,
                                                    cost: cumulativeCost,
                                                    x: (index / 2) * 100,
                                                    y: 100 - (cumulativeCost / maxCost) * 100
                                                };
                                            });

                                            const percentageData = [1, 2, 3].map((month, index) => {
                                                const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + index, 1);
                                                const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' });
                                                const cumulativeCost = monthlyPercentageCost * month;
                                                return {
                                                    month: monthName,
                                                    cost: cumulativeCost,
                                                    x: (index / 2) * 100,
                                                    y: 100 - (cumulativeCost / maxCost) * 100
                                                };
                                            });
                                                                                        
                                            return (
                                                <>
                                                    <div className="cost-line-chart">
                                                        <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
                                                            <line x1="0" y1="100%" x2="100%" y2="100%" stroke="#e5e7eb" strokeWidth="1" />
                                                            {(company["subscription price/ month"] !== null && company["subscription price/ month"] !== undefined) && subscriptionData.length >= 2 && (
                                                                <>
                                                                    <line x1={`${subscriptionData[0]?.x}%`} y1={`${subscriptionData[0]?.y}%`} x2={`${subscriptionData[1]?.x}%`} y2={`${subscriptionData[1]?.y}%`} stroke="#3b82f6" strokeWidth="3" />
                                                                    {subscriptionData.length >= 3 && (
                                                                        <line x1={`${subscriptionData[1]?.x}%`} y1={`${subscriptionData[1]?.y}%`} x2={`${subscriptionData[2]?.x}%`} y2={`${subscriptionData[2]?.y}%`} stroke="#3b82f6" strokeWidth="3" />
                                                                    )}
                                                                </>
                                                            )}
                                                            {company["Hourly rate"] !== undefined && company["Hourly rate"] !== null && hourlyData.length >= 2 && (
                                                                <>
                                                                    <line x1={`${hourlyData[0]?.x}%`} y1={`${hourlyData[0]?.y}%`} x2={`${hourlyData[1]?.x}%`} y2={`${hourlyData[1]?.y}%`} stroke="#10b981" strokeWidth="3" />
                                                                    {hourlyData.length >= 3 && (
                                                                        <line x1={`${hourlyData[1]?.x}%`} y1={`${hourlyData[1]?.y}%`} x2={`${hourlyData[2]?.x}%`} y2={`${hourlyData[2]?.y}%`} stroke="#10b981" strokeWidth="3" />
                                                                    )}
                                                                </>
                                                            )}
                                                            {company["percentage fee"] && percentageData.length >= 2 && (
                                                                <>
                                                                    <line x1={`${percentageData[0]?.x}%`} y1={`${percentageData[0]?.y}%`} x2={`${percentageData[1]?.x}%`} y2={`${percentageData[1]?.y}%`} stroke="#8b5cf6" strokeWidth="3" />
                                                                    {percentageData.length >= 3 && (
                                                                        <line x1={`${percentageData[1]?.x}%`} y1={`${percentageData[1]?.y}%`} x2={`${percentageData[2]?.x}%`} y2={`${percentageData[2]?.y}%`} stroke="#8b5cf6" strokeWidth="3" />
                                                                    )}
                                                                </>
                                                            )}
                                                        </svg>
                                                        {(company["subscription price/ month"] !== null && company["subscription price/ month"] !== undefined) && subscriptionData.map((point, index) => (
                                                            <div key={`sub-point-${index}`}>
                                                                <div className="cost-point" style={{ left: `${point.x}%`, top: `${point.y}%`, backgroundColor: '#3b82f6' }} />
                                                                <div className="cost-value-labels" style={{ left: `${point.x}%`, top: `${point.y - 10}%`, transform: 'translate(-50%, -50%)', color: '#3b82f6' }}>
                                                                    {point.cost === 0 ? "€0" : `€${point.cost.toFixed(1)}`}
                        </div>
                                                            </div>
                                                        ))}
                                                        {company["Hourly rate"] !== undefined && company["Hourly rate"] !== null && hourlyData.map((point, index) => (
                                                            <div key={`hr-point-${index}`}>
                                                                <div className="cost-point" style={{ left: `${point.x}%`, top: `${point.y}%`, backgroundColor: '#10b981' }} />
                                                                <div className="cost-value-labels" style={{ left: `${point.x}%`, top: `${point.y - 10}%`, transform: 'translate(-50%, -50%)', color: '#10b981' }}>
                                                                    {point.cost === 0 ? "€0" : `€${point.cost.toFixed(1)}`}
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {company["percentage fee"] !== undefined && company["percentage fee"] !== null && percentageData.map((point, index) => (
                                                            <div key={`perc-point-${index}`}>
                                                                <div className="cost-point" style={{ left: `${point.x}%`, top: `${point.y}%`, backgroundColor: '#8b5cf6' }} />
                                                                <div className="cost-value-labels" style={{ left: `${point.x}%`, top: `${point.y - 10}%`, transform: 'translate(-50%, -50%)', color: '#8b5cf6' }}>
                                                                    {point.cost === 0 ? "€0" : `€${point.cost.toFixed(1)}`}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="cost-month-labels">
                                                        {subscriptionData.map((point, index) => (
                                                            <span key={`month-${index}`}>{point.month}</span>
                                                        ))}
                                                    </div>
                                                </>
                                            );
                                        })()}
                    </div>

                                    {(() => {
                                        const hourlyRate = company["Hourly rate"] || 0;
                                        const monthlyHourlyCost = hourlyRate * calculatorHours * calculatorWeeksPerMonth;
                                        const percentageFee = company["percentage fee"] || 0;
                                        const monthlyPercentageCost = calculatorMonthlyTotal * (percentageFee / 100);
                                        const totalPercentageCost = calculatorTotalWithTax * (percentageFee / 100);
                                        const allCompanies = companies || [];
                                        const subscriptionModelCompanies = allCompanies.filter(c => 
                                            c["subscription price/ month"] && 
                                            c["subscription price/ month"] > 0 &&
                                            c["subscription price/ month"] < 10000
                                        );
                                        const subscriptionCosts = subscriptionModelCompanies
                                            .map(c => Number(c["subscription price/ month"]))
                                            .filter((cost): cost is number => !isNaN(cost) && cost > 0);
                                        
                                        const averageSubscription = subscriptionCosts.length > 0 
                                            ? subscriptionCosts.reduce((sum: number, cost: number) => sum + cost, 0) / subscriptionCosts.length 
                                            : 0;
                                        
                                        const currentSubscription = company["subscription price/ month"] || 0;
                                        const percentageOfAverage = averageSubscription > 0 
                                            ? (currentSubscription / averageSubscription) * 100 
                                            : 0;
                                        
                                        let ratioColor = "#6b7280";
                                        
                                        if (percentageOfAverage > 150) {
                                            ratioColor = "#dc2626";
                                        } else if (percentageOfAverage > 120) {
                                            ratioColor = "#ea580c";
                                        } else if (percentageOfAverage > 80) {
                                            ratioColor = "#6b7280";
                                        } else if (percentageOfAverage > 50) {
                                            ratioColor = "#059669";
                                        } else {
                                            ratioColor = "#059669";
                                        }
                                        
                                        return (
                                            <div className="cost-summary-box">
                                                <h4 className="cost-summary-title">Price Analysis & Cost Summary</h4>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                    {company["subscription price/ month"] ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                                                            <span style={{ color: '#6b7280' }}>Subscription Average:</span>
                                                            <span style={{ color: '#374151', fontWeight: '600' }}>{averageSubscription === 0 ? "No data" : `€${averageSubscription.toFixed(1)}/month`}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                                                            <span style={{ color: '#6b7280' }}>This Company:</span>
                                                            <span style={{ color: '#374151', fontWeight: '600' }}>{currentSubscription === 0 ? "Free" : `€${(currentSubscription || 0).toFixed(1)}/month`}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                                                            <span style={{ color: '#6b7280' }}>Comparison:</span>
                                                            <span style={{ color: ratioColor, fontWeight: '600' }}>
                                                                {percentageOfAverage > 100 ? 'Above Average' : percentageOfAverage < 100 ? 'Below Average' : 'Average'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    ) : null}
                                                    
                                                    <div>
                                                        {(company["subscription price/ month"] !== null && company["subscription price/ month"] !== undefined) && (
                                                            <div className="cost-summary-item">
                                                                <span className="cost-summary-label">Monthly:</span>
                                                                <span className="cost-summary-value">{company["subscription price/ month"] === 0 ? "Free" : `€${(company["subscription price/ month"] || 0).toFixed(1)}`}</span>
                                                            </div>
                                                        )}
                                                        {company["Hourly rate"] !== undefined && company["Hourly rate"] !== null && (
                                                            <>
                                                                <div className="cost-summary-item">
                                                                    <span className="cost-summary-label">Hourly Rate:</span>
                                                                    <span className="cost-summary-value">{company["Hourly rate"] === 0 ? "Not specified" : `€${(company["Hourly rate"] || 0).toFixed(1)}/hour`}</span>
                                                                </div>
                                                                <div className="cost-summary-item">
                                                                    <span className="cost-summary-label">Monthly Cost:</span>
                                                                    <span className="cost-summary-value">{monthlyHourlyCost === 0 ? "No cost" : `€${monthlyHourlyCost.toFixed(1)}`}</span>
                                                                </div>
                                                            </>
                                                        )}
                                                        {company["percentage fee"] !== undefined && company["percentage fee"] !== null && (
                                                            <>
                                                                <div className="cost-summary-item">
                                                                    <span className="cost-summary-label">Percentage fees:</span>
                                                                    <span className="cost-summary-value">{company["percentage fee"] === 0 ? "No fee" : `${company["percentage fee"]}%`}</span>
                                                                </div>
                                                                <div className="cost-summary-item">
                                                                    <span className="cost-summary-label">Monthly Cost:</span>
                                                                    <span className="cost-summary-value">{monthlyPercentageCost === 0 ? "No cost" : `€${monthlyPercentageCost.toFixed(1)}`}</span>
                                                                </div>
                                                                <div className="cost-summary-item">
                                                                    <span className="cost-summary-label">Total Cost:</span>
                                                                    <span className="cost-summary-value">{totalPercentageCost === 0 ? "No cost" : `€${totalPercentageCost.toFixed(1)}`}</span>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button
                            onClick={onClose}
                            className="modal-close-btn"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Search Bar Component
const SearchBar: React.FC<{
    value: string;
    onChange: (value: string) => void;
}> = ({ value, onChange }) => (
    <div className="search-container">
        <Search className="search-icon" />
        <input
            type="text"
            placeholder="Search companies..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="search-input"
        />
    </div>
);

// Main Component
export default function AutomationCompanies() {
    const [companies, setCompanies] = useState<AutomationDetails[]>([]);
    const [filteredCompanies, setFilteredCompanies] = useState<AutomationDetails[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [modelFilter, setModelFilter] = useState<string>('all');
    const [customerFilter, setCustomerFilter] = useState<string>('all');
    const [pricingModelFilter, setPricingModelFilter] = useState<string>('all');
    const [whoPaysFilter, setWhoPaysFilter] = useState<string>('all');
    const [selectedCompany, setSelectedCompany] = useState<AutomationDetails | null>(null);
    const [selectedCompanies, setSelectedCompanies] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const { needsProfile, loading: profileLoading } = useProfileCheck(user);

    // Calculator state
    const [rate, setRate] = useState<number | ''>(75);
    const [hours, setHours] = useState<number | ''>(32);
    const [weeksPerMonth, setWeeksPerMonth] = useState<number | ''>(4);
    const [months, setMonths] = useState<number | ''>(3);
    const [tax, setTax] = useState<number>(21);
    const [subtotal, setSubtotal] = useState<number>(0);
    const [taxAmount, setTaxAmount] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const [monthlySubtotal, setMonthlySubtotal] = useState<number>(0);
    const [monthlyTaxAmount, setMonthlyTaxAmount] = useState<number>(0);
    const [monthlyTotal, setMonthlyTotal] = useState<number>(0);
    const [totalWithTax, setTotalWithTax] = useState<number>(0);

    // Calculate totals when inputs change
    useEffect(() => {
        const rateNum = typeof rate === 'number' ? rate : 0;
        const hoursNum = typeof hours === 'number' ? hours : 0;
        const weeksPerMonthNum = typeof weeksPerMonth === 'number' ? weeksPerMonth : 0;
        const monthsNum = typeof months === 'number' ? months : 0;
        const taxNum = tax || 0;

        const subtotalCalc = rateNum * hoursNum * weeksPerMonthNum * monthsNum;
        const taxAmountCalc = subtotalCalc * (taxNum / 100);
        const totalCalc = subtotalCalc + taxAmountCalc;

        const monthlySubtotalCalc = rateNum * hoursNum * weeksPerMonthNum;
        const monthlyTaxAmountCalc = monthlySubtotalCalc * (taxNum / 100);

        setSubtotal(subtotalCalc);
        setTaxAmount(taxAmountCalc);
        setTotal(totalCalc);
        setMonthlySubtotal(monthlySubtotalCalc);
        setMonthlyTaxAmount(monthlyTaxAmountCalc);
        setMonthlyTotal(monthlySubtotalCalc + monthlyTaxAmountCalc);
        setTotalWithTax(totalCalc);
    }, [rate, hours, weeksPerMonth, months, tax]);

    // Calculate costs for selected companies
    const calculateSelectedCompanyCosts = () => {
        const selectedCompanyData = companies.filter(company => selectedCompanies.has(company.id));
        
        const costs = {
            subscription: { monthly: 0, quarterly: 0 },
            percentage: { monthly: 0, quarterly: 0 },
            transaction: { monthly: 0, quarterly: 0 },
            hourly: { monthly: 0, quarterly: 0 },
            fixed: { monthly: 0, quarterly: 0 },
            total: { monthly: 0, quarterly: 0 }
        };

        selectedCompanyData.forEach(company => {
            // Subscription costs
            if (company["subscription price/ month"] && company["subscription price/ month"] > 0) {
                costs.subscription.monthly += company["subscription price/ month"];
                costs.subscription.quarterly += company["subscription price/ month"] * 3;
            }

            // Percentage fees (calculated on monthly and quarterly totals)
            if (company["percentage fee"] && company["percentage fee"] > 0) {
                const percentageRate = company["percentage fee"] / 100;
                costs.percentage.monthly += monthlyTotal * percentageRate;
                costs.percentage.quarterly += total * percentageRate;
            }

            // Transaction fees
            if (company["transaction fees"] && company["transaction fees"] > 0) {
                costs.transaction.monthly += company["transaction fees"];
                costs.transaction.quarterly += company["transaction fees"] * 3;
            }

            // Transaction percentage
            if (company["transaction %"] && company["transaction %"] > 0) {
                const transactionRate = company["transaction %"] / 100;
                costs.transaction.monthly += monthlyTotal * transactionRate;
                costs.transaction.quarterly += total * transactionRate;
            }

            // Hourly rates
            if (company["Hourly rate"] && company["Hourly rate"] > 0) {
                const hourlyCost = (typeof hours === 'number' ? hours : 32) * (typeof weeksPerMonth === 'number' ? weeksPerMonth : 4) * company["Hourly rate"];
                costs.hourly.monthly += hourlyCost;
                costs.hourly.quarterly += hourlyCost * 3;
            }

            // Fixed prices
            if (company["Fixed price"] && company["Fixed price"] > 0) {
                costs.fixed.monthly += company["Fixed price"];
                costs.fixed.quarterly += company["Fixed price"] * 3;
            }
        });

        // Calculate totals
        costs.total.monthly = costs.subscription.monthly + costs.percentage.monthly + costs.transaction.monthly + costs.hourly.monthly + costs.fixed.monthly;
        costs.total.quarterly = costs.subscription.quarterly + costs.percentage.quarterly + costs.transaction.quarterly + costs.hourly.quarterly + costs.fixed.quarterly;

        return costs;
    };

    const selectedCompanyCosts = calculateSelectedCompanyCosts();

        const fetchCompanies = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('automation_details')
                    .select('*')
                .order('Company_name');

            if (error) {
                throw error;
            }

                setCompanies(data || []);
            setFilteredCompanies(data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

    const checkUser = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
        if (user) {
                setUser(user);
            }
        } catch (error) {
            console.error('Error checking user:', error);
        }
    };

    useEffect(() => {
        let filtered = companies;
        
        if (searchTerm.trim()) {
            filtered = filtered.filter(company =>
                company.Company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (company["Company description"] && company["Company description"].toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        
        if (modelFilter !== 'all') {
            filtered = filtered.filter(company => {
                if (modelFilter === 'paid') {
                    return company["paid/free"]?.toLowerCase().includes('paid');
                } else if (modelFilter === 'free') {
                    return company["paid/free"]?.toLowerCase().includes('free');
                }
                return true;
            });
        }
        
        if (customerFilter !== 'all') {
            filtered = filtered.filter(company => {
                if (customerFilter === 'private') {
                    return company["private company"];
                } else if (customerFilter === 'semi-gov') {
                    return company["semi government"];
                } else if (customerFilter === 'government') {
                    return company.government;
                }
                return true;
            });
        }
        
        if (pricingModelFilter !== 'all') {
            filtered = filtered.filter(company => {
                if (pricingModelFilter === 'subscription') {
                    return company["subscription price/ month"] && company["subscription price/ month"] > 0;
                } else if (pricingModelFilter === 'transaction') {
                    return company["transaction %"] && company["transaction %"] > 0;
                } else if (pricingModelFilter === 'percentage') {
                    return company["percentage fee"] && company["percentage fee"] > 0;
                } else if (pricingModelFilter === 'hourly') {
                    return company["Hourly rate"] && company["Hourly rate"] > 0;
                } else if (pricingModelFilter === 'fixed') {
                    return company["Fixed price"] && company["Fixed price"] > 0;
                }
                return true;
            });
        }
        
        if (whoPaysFilter !== 'all') {
            filtered = filtered.filter(company => {
                if (whoPaysFilter === 'employer') {
                    return company["paid by employer"] === true;
                } else if (whoPaysFilter === 'freelancer') {
                    return company["paid by employer"] === false || company["paid by employer"] === null;
                }
                return true;
            });
        }
        
        setFilteredCompanies(filtered);
    }, [searchTerm, modelFilter, customerFilter, pricingModelFilter, whoPaysFilter, companies]);

    useEffect(() => {
        checkUser();
        fetchCompanies();
        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
          authListener.subscription.unsubscribe();
        };
    }, []);

    if (profileLoading) {
        return <div className="loading">Loading...</div>;
    }

    if (needsProfile) {
        return <CompleteProfileForm onComplete={() => {
            checkUser();
        }} />;
    }

    if (loading) {
        return <div className="loading">Loading companies...</div>;
    }

    if (error) {
        return <div className="error">Error: {error}</div>;
    }

    return (
        <div className="container">
                <div className="stats-section">
                    <div className="stats-card">
                        <div className="stats-content">
                            <div>
                                <h2 className="stats-title">allGigs job boards</h2>
                                <p className="stats-subtitle">
                                    {filteredCompanies.length} of {companies.length} companies
                                </p>
                            </div>
                            </div>
                        
                        <div className="filters-container">
                            <div className="search-and-filters">
                                <SearchBar value={searchTerm} onChange={setSearchTerm} />
                                <div className="model-filter">
                                    <label className="filter-label">Paid/Free:</label>
                                    <select 
                                        value={modelFilter} 
                                        onChange={(e) => setModelFilter(e.target.value)}
                                        className="model-filter-select"
                                    >
                                        <option value="all">All Models</option>
                                        <option value="paid">Paid</option>
                                        <option value="free">Free</option>
                                    </select>
                                </div>
                                <div className="model-filter">
                                    <label className="filter-label">Customer Type:</label>
                                    <select 
                                        value={customerFilter} 
                                        onChange={(e) => setCustomerFilter(e.target.value)}
                                        className="model-filter-select"
                                    >
                                        <option value="all">All Types</option>
                                        <option value="private">Private</option>
                                        <option value="semi-gov">Semi-Gov</option>
                                        <option value="government">Government</option>
                                    </select>
                                </div>
                                <div className="model-filter">
                                    <label className="filter-label">Pricing Model:</label>
                                    <select 
                                        value={pricingModelFilter} 
                                        onChange={(e) => setPricingModelFilter(e.target.value)}
                                        className="model-filter-select"
                                    >
                                        <option value="all">All Models</option>
                                        <option value="subscription">Subscription</option>
                                        <option value="transaction">Transaction Fee</option>
                                        <option value="percentage">Percentage</option>
                                        <option value="hourly">Hourly Rate</option>
                                        <option value="fixed">Fixed Price</option>
                                    </select>
                                </div>
                                <div className="model-filter">
                                    <label className="filter-label">Who pays:</label>
                                    <select 
                                        value={whoPaysFilter} 
                                        onChange={(e) => setWhoPaysFilter(e.target.value)}
                                        className="model-filter-select"
                                    >
                                        <option value="all">All</option>
                                        <option value="employer">Employer</option>
                                        <option value="freelancer">Freelancer</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                            <div className="calculator-section">
                    <div className="calculator-split-container">
                        <div className="calculator-left">
                            <div className="calculator-header">
                                <h2>Calculator</h2>
                                                                <div className="info-tooltip-container">
                                    <Info size={14} className="info-icon" />
                                    <div className="info-tooltip calculator-tooltip">
                                        Some partners calculate costs based on a percentage of earnings or hours worked. To get the most accurate estimate, please enter your own calculation. We currently use a default.
                    </div>
                                </div>
                            </div>
                        <div className="calculation-inputs">
                            <div className="calc-input-group">
                                <label className="calc-label">Rate (€/hour)</label>
                                <input
                                    type="number"
                                    className="calc-input"
                                    value={rate}
                                    onChange={(e) => setRate(e.target.value === '' ? '' : Number(e.target.value))}
                                    placeholder=""
                                />
                            </div>
                            <div className="calc-input-group">
                                <label className="calc-label">Hours per week</label>
                                <input
                                    type="number"
                                    className="calc-input"
                                    value={hours}
                                    onChange={(e) => setHours(e.target.value === '' ? '' : Number(e.target.value))}
                                    placeholder=""
                                />
                            </div>
                            <div className="calc-input-group">
                                <label className="calc-label">Weeks per month</label>
                                <input
                                    type="number"
                                    className="calc-input"
                                    value={weeksPerMonth}
                                    onChange={(e) => setWeeksPerMonth(e.target.value === '' ? '' : Number(e.target.value))}
                                    placeholder=""
                                />
                            </div>
                            <div className="calc-input-group">
                                <label className="calc-label">Months</label>
                                <input
                                    type="number"
                                    className="calc-input"
                                    value={months}
                                    onChange={(e) => setMonths(e.target.value === '' ? '' : Number(e.target.value))}
                                    placeholder=""
                                />
                            </div>
                            <div className="calc-input-group">
                                <label className="calc-label">Tax (%)</label>
                                <input
                                    type="number"
                                    className="calc-input"
                                    value={tax}
                                    onChange={(e) => setTax(Number(e.target.value))}
                                    placeholder=""
                                />
                            </div>
                        </div>
                        <div className="calculation-results">
                            <div className="calc-results-simple">
                                <div className="calc-monthly-section">
                                    <h4>Per Month</h4>
                                    <div className="calc-result-row">
                                        <span>Subtotal:</span>
                                        <span>€{monthlySubtotal.toFixed(1)}</span>
                                    </div>
                                    <div className="calc-result-row">
                                        <span>Tax:</span>
                                        <span>+ €{monthlyTaxAmount.toFixed(1)}</span>
                                    </div>
                                    <div className="calc-result-row">
                                        <span>Total:</span>
                                        <span>€{(monthlySubtotal + monthlyTaxAmount).toFixed(1)}</span>
                                    </div>
                                </div>
                                <div className="calc-total-section">
                                    <h4>Total</h4>
                                    <div className="calc-result-row">
                                        <span>Subtotal:</span>
                                        <span>€{subtotal.toFixed(1)}</span>
                                    </div>
                                    <div className="calc-result-row">
                                        <span>Tax:</span>
                                        <span>+ €{taxAmount.toFixed(1)}</span>
                                    </div>
                                    <div className="calc-result-row">
                                        <span>Total:</span>
                                        <span>€{total.toFixed(1)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="calculator-right">
                        <h2>Comparison</h2>
                        <div className="selected-companies-costs">
                            {(() => {
                                const selectedCompanyData = companies.filter(company => selectedCompanies.has(company.id));
                                
                                if (selectedCompanyData.length === 0) {
                                    return (
                                        <div className="no-selection-message">
                                            <p>No companies selected. Select companies using the checkboxes to see their cost breakdown.</p>
                                        </div>
                                    );
                                }
                                
                                return selectedCompanyData.map((company) => {
                                    // Calculate this company's costs
                                    let companyMonthlyCost = 0;
                                    let companyQuarterlyCost = 0;
                                    const costBreakdown = [];
                                    
                                    // Subscription costs
                                    if (company["subscription price/ month"] && company["subscription price/ month"] > 0) {
                                        companyMonthlyCost += company["subscription price/ month"];
                                        companyQuarterlyCost += company["subscription price/ month"] * 3;
                                        costBreakdown.push({
                                            label: "Subscription fees:",
                                            monthly: company["subscription price/ month"],
                                            quarterly: company["subscription price/ month"] * 3
                                        });
                                    }
                                    
                                    // Percentage fees
                                    if (company["percentage fee"] && company["percentage fee"] > 0) {
                                        const percentageRate = company["percentage fee"] / 100;
                                        const monthlyPercentageCost = monthlyTotal * percentageRate;
                                        const quarterlyPercentageCost = total * percentageRate;
                                        companyMonthlyCost += monthlyPercentageCost;
                                        companyQuarterlyCost += quarterlyPercentageCost;
                                        costBreakdown.push({
                                            label: "Percentage fees:",
                                            monthly: monthlyPercentageCost,
                                            quarterly: quarterlyPercentageCost
                                        });
                                    }
                                    
                                    // Transaction fees
                                    if (company["transaction fees"] && company["transaction fees"] > 0) {
                                        companyMonthlyCost += company["transaction fees"];
                                        companyQuarterlyCost += company["transaction fees"] * 3;
                                        costBreakdown.push({
                                            label: "Transaction fees:",
                                            monthly: company["transaction fees"],
                                            quarterly: company["transaction fees"] * 3
                                        });
                                    }
                                    
                                    // Transaction percentage
                                    if (company["transaction %"] && company["transaction %"] > 0) {
                                        const transactionRate = company["transaction %"] / 100;
                                        const monthlyTransactionCost = monthlyTotal * transactionRate;
                                        const quarterlyTransactionCost = total * transactionRate;
                                        companyMonthlyCost += monthlyTransactionCost;
                                        companyQuarterlyCost += quarterlyTransactionCost;
                                        costBreakdown.push({
                                            label: "Transaction %:",
                                            monthly: monthlyTransactionCost,
                                            quarterly: quarterlyTransactionCost
                                        });
                                    }
                                    
                                    // Hourly rates
                                    if (company["Hourly rate"] && company["Hourly rate"] > 0) {
                                        const hourlyCost = (typeof hours === 'number' ? hours : 32) * (typeof weeksPerMonth === 'number' ? weeksPerMonth : 4) * company["Hourly rate"];
                                        companyMonthlyCost += hourlyCost;
                                        companyQuarterlyCost += hourlyCost * 3;
                                        costBreakdown.push({
                                            label: "Hourly rate:",
                                            monthly: hourlyCost,
                                            quarterly: hourlyCost * 3
                                        });
                                    }
                                    
                                    // Fixed prices
                                    if (company["Fixed price"] && company["Fixed price"] > 0) {
                                        companyMonthlyCost += company["Fixed price"];
                                        companyQuarterlyCost += company["Fixed price"] * 3;
                                        costBreakdown.push({
                                            label: "Fixed price:",
                                            monthly: company["Fixed price"],
                                            quarterly: company["Fixed price"] * 3
                                        });
                                    }
                                    
                                    // If no costs, show "Free"
                                    if (costBreakdown.length === 0) {
                                        costBreakdown.push({
                                            label: "Free",
                                            monthly: 0,
                                            quarterly: 0
                                        });
                                    }
                                    
                                    return (
                                        <div key={company.id} className="company-cost-card">
                                            <div className="company-cost-header">
                                                <div className="company-cost-title-row">
                                                    <h3 className="company-cost-title">{company.Company_name}</h3>
                                                    <span className="company-cost-pricing-info">
                                                        <span className="pricing-label">Pricing info:</span>
                                                        {company["Pricing info found?"] === true || company["Pricing info found?"] === 'yes' || company["Pricing info found?"] === 'Yes' ? 'Yes' : 
                                                         company["Pricing info found?"] === false || company["Pricing info found?"] === 'no' || company["Pricing info found?"] === 'No' ? (
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                No
                                                                <div className="info-tooltip-container">
                                                                    <Info size={14} className="info-icon" />
                                                                    <div className="info-tooltip">
                                                                        We could not find any information regarding the pricing, we therefore guess based on experience. The information might be wrong.
                                                                    </div>
                                                                </div>
                                                            </span>
                                                         ) : (
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                {company["Pricing info found?"] ? company["Pricing info found?"].toString() : 'Not specified'}
                                                                <div className="info-tooltip-container">
                                                                    <Info size={14} className="info-icon" />
                                                                    <div className="info-tooltip">
                                                                        We could not find any information regarding the pricing, we therefore guess based on experience. The information might be wrong.
                                                                    </div>
                                                                </div>
                                                            </span>
                                                         )}
                                                    </span>
                                                    <button className="visit-website-btn" onClick={() => window.open(company.Website || '#', '_blank')}>
                                                        Visit Website
                                                    </button>
                                                    <button 
                                                        className="company-cost-remove-btn"
                                                        onClick={() => {
                                                            const newSelected = new Set(selectedCompanies);
                                                            newSelected.delete(company.id);
                                                            setSelectedCompanies(newSelected);
                                                        }}
                                                        title="Remove from selection"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="company-cost-breakdown">
                                                {costBreakdown.map((cost, index) => (
                                                    <div key={index} className="cost-item">
                                                        <span className="cost-label">{cost.label}</span>
                                                        <span className="cost-value">
                                                            €{cost.monthly.toFixed(1)}/month
                                                        </span>
                                                    </div>
                                                ))}
                                                <div className="cost-total">
                                                    <span className="cost-label">Total:</span>
                                                    <span className="cost-value">
                                                        €{companyMonthlyCost.toFixed(1)}/month | €{companyQuarterlyCost.toFixed(1)}/quarter
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                </div>
            </div>

                    <div className="companies-grid">
                        {filteredCompanies.map((company) => (
                            <CompanyCard
                                key={company.id}
                                company={company}
                                onClick={() => setSelectedCompany(company)}
                                isSelected={selectedCompanies.has(company.id)}
                                onSelectionChange={(companyId, selected) => {
                                    const newSelected = new Set(selectedCompanies);
                                    if (selected) {
                                        newSelected.add(companyId);
                                    } else {
                                        newSelected.delete(companyId);
                                    }
                                    setSelectedCompanies(newSelected);
                                }}
                            />
                        ))}
                    </div>

            {selectedCompany && (
                <CompanyDetailModal
                    company={selectedCompany}
                    companies={companies}
                    onClose={() => setSelectedCompany(null)}
                    calculatorHours={typeof hours === 'number' ? hours : 32}
                    calculatorWeeksPerMonth={typeof weeksPerMonth === 'number' ? weeksPerMonth : 4}
                    calculatorMonthlyTotal={monthlyTotal}
                    calculatorTotalWithTax={totalWithTax}
                />
            )}
        </div>
    );
} 
