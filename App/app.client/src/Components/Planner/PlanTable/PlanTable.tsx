import { useMemo } from "react";
import useAuth from "../../Authentication/AuthProvider";
import useDistrict from "../../DataProviders/DistrictDataProvider";
import usePlans from "../../DataProviders/PlanDataProvider";
import { formatDate, generateDateRange, nameOfDaysCZ } from "../../../Util/DateUtil";
import RangerCell from "../RangerCell";
import PlanRecord from "../PlanRecord/PlanRecord";

const PlanTable: React.FC = () : JSX.Element => {
    const { hasRole } = useAuth();
    const { rangers } = useDistrict();
    const { plans, dateRange } = usePlans();

    const dateArray = useMemo(() => {
        return dateRange.start && dateRange.end ? generateDateRange(dateRange.start, dateRange.end) : [];
    }, [dateRange]);

    return (
        <div className="table-container">
            {dateArray.length > 0 && (
                <table className="plan-table">
                    <thead>
                        <tr>
                            <th className="sticky"></th>
                            {dateArray.map((date, index) => {
                                const Weekend = date.getDay() == 0 || date.getDay() == 6;
                                return (
                                    <th className={Weekend ? "weekend date-header" : "date-header"} key={index}>
                                        <div>
                                            {nameOfDaysCZ[date.getDay()]}
                                        </div>
                                        <div>
                                            {date.getDate()}.{(date.getMonth() + 1)}.
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {rangers?.map(ranger => {

                            const isheadOfDistrict = hasRole("HeadOfDistrict");

                            return (
                                <tr key={ranger.id}>
                                    <td className="sticky">
                                        <RangerCell ranger={ranger} />
                                    </td>

                                    {dateArray.map((date, index) => {
                                        const Weekend = date.getDay() == 0 || date.getDay() == 6;
                                        const stringDate = formatDate(date);
                                        const plan = plans.find(p => (p.ranger.id === ranger.id && p.date === stringDate));
                                        return (

                                            <td className={Weekend ? "weekend plan" : "plan"} key={index}>
                                                <PlanRecord
                                                    plan={plan ? plan : { date: stringDate, ranger: ranger, routeIds: [], vehicleIds: [] }}
                                                    isEditable={isheadOfDistrict}
                                                    includeRangerName={false}
                                                />
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
}
export default PlanTable;