import {
    AtSymbolIcon,
    KeyIcon,
    ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { lusitana } from '@/app/ui/font';
import Button from '@/app/ui/Button'

const LoginButton = () =>
    <Button className='mt-4 w-full'>
        Log in <ArrowRightIcon className='ml-auto h-5 w-5 text-gray-50' />
    </Button>

const LoginForm = () => {
    return (
        <form className='space-y-3'>
            <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
                <h1 className={`${lusitana.className} mb-3 text-2xl`}>
                    Please log in to continue
                </h1>
                <div className="w-full">
                    <div>
                        <label
                            htmlFor="email"
                            className="mb-3 mt-5 block text-xs font-medium text-gray-900"
                        >
                            Email
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                id="email"
                                className="peer py-[9px] block w-full rounded-md border border-gray-200 pl-10 text-sm outline-2 placeholder:text-gray-500"
                                name='email'
                                placeholder='Enter your email address'
                                required
                            />
                            <AtSymbolIcon
                                className='pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900'
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label
                            htmlFor="password"
                            className="mb-3 mt-5 block text-xs font-medium text-gray-900"
                        >
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                id="password"
                                name='password'
                                className="peer py-[9px] block w-full rounded-md border border-gray-200 pl-10 text-sm outline-2 placeholder:text-gray-500"
                                minLength={6}
                                placeholder='Enter Password'
                                required
                            />
                            <KeyIcon
                                className='pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900'
                            />
                        </div>
                    </div>
                </div>
                <LoginButton />
                <div className="flex h-8 items-end space-x-1">

                </div>
            </div>
        </form>
    );
};

export default LoginForm;