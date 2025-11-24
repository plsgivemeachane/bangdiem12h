'use client'
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, Users, Scale, Activity, BarChart, TrendingUp, ClipboardCheck, History as HistoryIcon, Zap, ShieldCheck, Smartphone } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { UserTag } from "@/components/ui/user-tag";
import Link from "next/link";

export default function LandingPage() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#ffd54a] to-[#FFF8DE] relative flex flex-col">
            {/* Decorative Shapes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Circles */}
                <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-[#0059ff] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-[20%] right-[-10%] w-72 h-72 bg-[#2600ff] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-20%] left-[20%] w-80 h-80 bg-[#0040ff] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

                {/* Rectangles */}
                <div className="absolute top-[15%] left-[10%] w-24 h-24 bg-[#000dff] rounded-[2rem] rotate-12 opacity-20 border border-white/50"></div>
                <div className="absolute bottom-[30%] right-[15%] w-32 h-32 bg-[#0059ff] rounded-[2rem] -rotate-6 opacity-20 border border-white/50"></div>
                <div className="absolute top-[40%] left-[80%] w-16 h-16 bg-[#0059ff] rounded-2xl rotate-45 opacity-10"></div>
            </div>

            <nav className="sticky top-4 z-50 mx-auto max-w-screen-xl w-full flex items-center justify-between px-6 py-3 rounded-full border border-[#AAC4F5]/20 bg-[#FFF8DE]/30 backdrop-blur-md shadow-lg">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" className="text-gray-800 text-xl hover:text-[#8CA9FF] hover:bg-[#FFF8DE]/50 rounded-full" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</Button>
                    <Button variant="ghost" className="text-gray-800 text-xl hover:text-[#8CA9FF] hover:bg-[#FFF8DE]/50 rounded-full" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>Feature</Button>
                    <Button variant="ghost" className="text-gray-800 text-xl hover:text-[#8CA9FF] hover:bg-[#FFF8DE]/50 rounded-full" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>Pricing</Button>
                    <Button variant="ghost" className="text-gray-800 text-xl hover:text-[#8CA9FF] hover:bg-[#FFF8DE]/50 rounded-full" onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}>About Us</Button>
                </div>

                <div className="flex items-center gap-4">
                    {isAuthenticated ? (
                        <UserTag
                            name={user?.name}
                            email={user?.email}
                            size="sm"
                            className="cursor-pointer bg-white/50 rounded-full pr-4 py-1"
                            onClick={() => router.push("/dashboard")}
                        />
                    ) : (
                        <Button asChild className="rounded-full bg-[#4271fe] hover:bg-[#3b66e5] text-white px-6">
                            <Link href="/auth/signin">Login</Link>
                        </Button>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 flex flex-col items-center justify-center p-4 text-center h-[100vh]">
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter bg-gradient-to-b from-[#4271fe] to-[#AAC4F5] bg-clip-text text-transparent drop-shadow-sm">
                    CLASS MANAGEMENT
                </h1>
                <p className="mt-6 text-xl md:text-2xl text-gray-600 font-medium tracking-wide mx-16 max-w-4xl">
                    Our platform is designed to streamline the complexities of class management, making education more accessible and efficient for everyone. From scheduling to progress tracking, we empower educators and students alike to focus on what truly matters: learning and growth.
                </p>

                {/* Glassmorphism Button with Jumping Animation */}
                <button
                    className="mt-10 px-8 py-4 rounded-full bg-white/20 backdrop-blur-lg border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 text-gray-800 font-semibold text-2xl hover:bg-white/30 animate-jump"
                    style={{
                        animation: 'jump 2s ease-in-out infinite'
                    }}
                >
                    Start here
                    <ChevronDown className="w-5 h-5" />
                </button>
            </main>

            {/* Features Section */}
            <section id="features" className="relative z-10 py-20 px-4 mb-20">
                <div className="mx-auto max-w-7xl">
                    <div className="bg-white/80 backdrop-blur-sm rounded-[3rem] p-12 md:p-16 shadow-2xl border border-white/50">
                        {/* Section Header */}
                        <div className="text-center mb-16">
                            <div className="flex items-center justify-center">
                                <p className="text-[#0059ff] font-semibold text-lg mb-3 uppercase tracking-wide bg-[#c2d7ff] px-4 py-2 rounded-full">Our Main Features</p>
                            </div>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6">
                                Our Primary Features
                            </h2>
                            <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                                Streamline your classroom management with powerful tools designed for both teachers and students. Track progress, manage scoring, and stay connected in real-time.
                            </p>
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                            {/* Feature 1 - Class Management */}
                            <div className="flex flex-col items-center text-center group">
                                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-[#4271fe]/10 to-[#0059ff]/5 group-hover:from-[#4271fe]/20 group-hover:to-[#0059ff]/10 transition-all duration-300">
                                    <Users className="w-12 h-12 text-[#4271fe] stroke-[2.5]" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Class Management</h3>
                                <p className="text-gray-600 leading-relaxed text-lg">
                                    Effortlessly organize class groups, invite students, and assign roles. Manage your classes with intuitive tools for smooth setup.
                                </p>
                            </div>

                            {/* Feature 2 - Custom Scoring */}
                            <div className="flex flex-col items-center text-center group">
                                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-[#4271fe]/10 to-[#0059ff]/5 group-hover:from-[#4271fe]/20 group-hover:to-[#0059ff]/10 transition-all duration-300">
                                    <Scale className="w-12 h-12 text-[#4271fe] stroke-[2.5]" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Custom Scoring</h3>
                                <p className="text-gray-600 leading-relaxed text-lg">
                                    Tailor your grading system with custom scoring, defining flexible rules for comprehensive and fair assessment.
                                </p>
                            </div>

                            {/* Feature 3 - Activity Logs */}
                            <div className="flex flex-col items-center text-center group">
                                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-[#4271fe]/10 to-[#0059ff]/5 group-hover:from-[#4271fe]/20 group-hover:to-[#0059ff]/10 transition-all duration-300">
                                    <Activity className="w-12 h-12 text-[#4271fe] stroke-[2.5]" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Activity Logs</h3>
                                <p className="text-gray-600 leading-relaxed text-lg">
                                    Detailed activity logs provide transparency and oversight. Track progress, review historical data, and ensure accountability effortlessly.
                                </p>
                            </div>

                            {/* Feature 4 - Performance Analytics */}
                            <div className="flex flex-col items-center text-center group">
                                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-[#4271fe]/10 to-[#0059ff]/5 group-hover:from-[#4271fe]/20 group-hover:to-[#0059ff]/10 transition-all duration-300">
                                    <BarChart className="w-12 h-12 text-[#4271fe] stroke-[2.5]" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Performance Analytics</h3>
                                <p className="text-gray-600 leading-relaxed text-lg">
                                    Gain valuable insights into class and student performance. Monitor trends, identify improvements, and celebrate successes with robust analytics.
                                </p>
                            </div>

                            {/* Feature 5 - Progress Tracking */}
                            <div className="flex flex-col items-center text-center group">
                                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-[#4271fe]/10 to-[#0059ff]/5 group-hover:from-[#4271fe]/20 group-hover:to-[#0059ff]/10 transition-all duration-300">
                                    <TrendingUp className="w-12 h-12 text-[#4271fe] stroke-[2.5]" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Progress Tracking</h3>
                                <p className="text-gray-600 leading-relaxed text-lg">
                                    Comprehensive progress tracking monitors academic growth. Visualize learning journeys and milestones with detailed charts and reports.
                                </p>
                            </div>

                            {/* Feature 6 - Self-Recording */}
                            <div className="flex flex-col items-center text-center group">
                                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-[#4271fe]/10 to-[#0059ff]/5 group-hover:from-[#4271fe]/20 group-hover:to-[#0059ff]/10 transition-all duration-300">
                                    <ClipboardCheck className="w-12 h-12 text-[#4271fe] stroke-[2.5]" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Self-Recording</h3>
                                <p className="text-gray-600 leading-relaxed text-lg">
                                    Empower students to proactively record their progress and accomplishments based on predefined class rules and criteria.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="relative z-10 py-20 px-4 mb-20">
                <div className="mx-auto max-w-7xl">
                    <div className="text-center mb-16">
                        <div className="flex items-center justify-center">
                            <p className="text-[#0059ff] font-semibold text-lg mb-3 uppercase tracking-wide bg-[#c2d7ff] px-4 py-2 rounded-full">Pricing Plans</p>
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6">
                            Choose Your Plan
                        </h2>
                        <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                            Select the perfect plan for your classroom needs. From individual teachers to large institutions, we have you covered.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Starter Plan */}
                        <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/50 shadow-xl flex flex-col relative overflow-hidden group hover:bg-white/80 transition-all duration-300">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gray-300"></div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
                            <div className="text-5xl font-black text-gray-900 mb-6">$0<span className="text-xl font-medium text-gray-500">/mo</span></div>
                            <p className="text-gray-600 mb-8">Perfect for trying out the platform.</p>
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-center gap-3 text-gray-700"><Zap className="w-5 h-5 text-yellow-500" /> Up to 1 Class</li>
                                <li className="flex items-center gap-3 text-gray-700"><Zap className="w-5 h-5 text-yellow-500" /> 30 Students Max</li>
                                <li className="flex items-center gap-3 text-gray-700"><Zap className="w-5 h-5 text-yellow-500" /> Basic Analytics</li>
                            </ul>
                            <Button className="w-full rounded-full py-6 text-lg bg-gray-900 hover:bg-gray-800 text-white shadow-lg">Get Started</Button>
                        </div>

                        {/* Pro Plan */}
                        <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 border-2 border-[#4271fe] shadow-2xl flex flex-col relative overflow-hidden transform md:-translate-y-4 z-10">
                            <div className="absolute top-0 left-0 w-full h-2 bg-[#4271fe]"></div>
                            <div className="absolute top-4 right-4 bg-[#4271fe] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Popular</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
                            <div className="text-5xl font-black text-[#4271fe] mb-6">$29<span className="text-xl font-medium text-gray-500">/mo</span></div>
                            <p className="text-gray-600 mb-8">For dedicated educators.</p>
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-center gap-3 text-gray-700"><Zap className="w-5 h-5 text-[#4271fe]" /> Unlimited Classes</li>
                                <li className="flex items-center gap-3 text-gray-700"><Zap className="w-5 h-5 text-[#4271fe]" /> Unlimited Students</li>
                                <li className="flex items-center gap-3 text-gray-700"><Zap className="w-5 h-5 text-[#4271fe]" /> Advanced Analytics</li>
                                <li className="flex items-center gap-3 text-gray-700"><Zap className="w-5 h-5 text-[#4271fe]" /> Priority Support</li>
                            </ul>
                            <Button className="w-full rounded-full py-6 text-lg bg-[#4271fe] hover:bg-[#3b66e5] text-white shadow-lg shadow-[#4271fe]/30">Upgrade Now</Button>
                        </div>

                        {/* Enterprise Plan */}
                        <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/50 shadow-xl flex flex-col relative overflow-hidden group hover:bg-white/80 transition-all duration-300">
                            <div className="absolute top-0 left-0 w-full h-2 bg-purple-500"></div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">School</h3>
                            <div className="text-5xl font-black text-gray-900 mb-6">Custom</div>
                            <p className="text-gray-600 mb-8">For entire schools and districts.</p>
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-center gap-3 text-gray-700"><ShieldCheck className="w-5 h-5 text-purple-500" /> Admin Dashboard</li>
                                <li className="flex items-center gap-3 text-gray-700"><ShieldCheck className="w-5 h-5 text-purple-500" /> SSO Integration</li>
                                <li className="flex items-center gap-3 text-gray-700"><ShieldCheck className="w-5 h-5 text-purple-500" /> Custom Training</li>
                                <li className="flex items-center gap-3 text-gray-700"><ShieldCheck className="w-5 h-5 text-purple-500" /> Dedicated Manager</li>
                            </ul>
                            <Button className="w-full rounded-full py-6 text-lg bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-900">Contact Sales</Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Us Section */}
            <section id="about" className="relative z-10 py-20 px-4 mb-20">
                <div className="mx-auto max-w-7xl">
                    <div className="bg-[#4271fe] rounded-[3rem] p-12 md:p-20 text-white shadow-2xl relative overflow-hidden">
                        {/* Decorative Circles in About Section */}
                        <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-[-10%] left-[-5%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                            <div>
                                <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wider mb-6">About Us</div>
                                <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                                    Empowering Education Through Technology
                                </h2>
                                <p className="text-white/80 text-lg md:text-xl leading-relaxed mb-8">
                                    We are a team of passionate educators and developers dedicated to transforming the classroom experience. We believe that technology should simplify administrative tasks, allowing teachers to focus on what they do best: inspiring the next generation.
                                </p>
                                <div className="flex flex-wrap gap-6">
                                    <div className="flex flex-col">
                                        <span className="text-4xl font-bold">10k+</span>
                                        <span className="text-white/70">Active Users</span>
                                    </div>
                                    <div className="w-px bg-white/20 h-12"></div>
                                    <div className="flex flex-col">
                                        <span className="text-4xl font-bold">500+</span>
                                        <span className="text-white/70">Schools</span>
                                    </div>
                                    <div className="w-px bg-white/20 h-12"></div>
                                    <div className="flex flex-col">
                                        <span className="text-4xl font-bold">99%</span>
                                        <span className="text-white/70">Satisfaction</span>
                                    </div>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="bg-white/10 backdrop-blur-md rounded-[2rem] p-8 border border-white/20">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#4271fe]">
                                            <Smartphone className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-xl">Mobile First</h4>
                                            <p className="text-white/70">Access anywhere, anytime.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#4271fe]">
                                            <ShieldCheck className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-xl">Secure & Private</h4>
                                            <p className="text-white/70">Your data is safe with us.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#4271fe]">
                                            <HistoryIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-xl">24/7 Support</h4>
                                            <p className="text-white/70">We are here when you need us.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 bg-white/80 backdrop-blur-md border-t border-white/50 pt-16 pb-8">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-1 md:col-span-2">
                            <h2 className="text-2xl font-black text-[#4271fe] mb-4">CLASS MANAGEMENT</h2>
                            <p className="text-gray-600 max-w-sm">
                                Making education management simple, efficient, and effective for everyone. Join the revolution in classroom administration today.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-4">Product</h4>
                            <ul className="space-y-2">
                                <li><Link href="#" className="text-gray-600 hover:text-[#4271fe]">Features</Link></li>
                                <li><Link href="#" className="text-gray-600 hover:text-[#4271fe]">Pricing</Link></li>
                                <li><Link href="#" className="text-gray-600 hover:text-[#4271fe]">Testimonials</Link></li>
                                <li><Link href="#" className="text-gray-600 hover:text-[#4271fe]">FAQ</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-4">Company</h4>
                            <ul className="space-y-2">
                                <li><Link href="#" className="text-gray-600 hover:text-[#4271fe]">About Us</Link></li>
                                <li><Link href="#" className="text-gray-600 hover:text-[#4271fe]">Careers</Link></li>
                                <li><Link href="#" className="text-gray-600 hover:text-[#4271fe]">Blog</Link></li>
                                <li><Link href="#" className="text-gray-600 hover:text-[#4271fe]">Contact</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-500 text-sm">© 2024 Class Management. All rights reserved.</p>
                        <div className="flex gap-6">
                            <Link href="#" className="text-gray-400 hover:text-[#4271fe]">Privacy Policy</Link>
                            <Link href="#" className="text-gray-400 hover:text-[#4271fe]">Terms of Service</Link>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Add the jumping animation keyframes */}
            <style jsx>{`
                @keyframes jump {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }
            `}</style>
        </div>
    )
}