import {
    BanknotesIcon,
    ClockIcon,
    UserGroupIcon,
    InboxIcon
} from '@heroicons/react/24/outline'
import { lusitana } from '@/app/ui/font'

const iconMap = {
    collected: BanknotesIcon,
    customers: UserGroupIcon,
    pending: ClockIcon,
    invoices: InboxIcon
}

export const Card = ({
    title,
    value,
    type
}: {
    title: string,
    value: number | string
    type: 'invoices' | 'customers' | 'pending' | 'collected'
}) => {
    const CardIcon = iconMap[type]

    return (
        <div className="rounded-xl bg-gray-50 p-2 shadow-sm">
            <div className="flex p-4">
                {CardIcon
                    ? <CardIcon className='h-5 w-5 text-gray-700' />
                    : null
                }
                <h3 className="ml-2 text-sm font-medium">{title}</h3>
            </div>
            <p className={`${lusitana.className} truncate rounded-xl bg-white px-4 py-8 text-center text-2xl`}>
                {value}
            </p>
        </div>
    )
}

const Cards = () => {
    return (
        <>
            {/* <Card
                title='Collected'
                type='collected'
                value={totalPaidInvoices}
            />
            <Card
                title='Pending'
                type='pending'
                value={totalPendingInvoices}
            />
            <Card
                title='Total Invoices'
                type='invoices'
                value={numberOfInvoices}
            />
            <Card
                title='Total Customers'
                type='customers'
                value={numberOfCustomers}
            /> */}
        </>
    );
};

export default Cards;