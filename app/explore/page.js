'use client'
import Link from 'next/link'
import React from 'react'
import { ArrowRight, Ship, Sprout, Droplets, Sun, Smartphone, Zap, BarChart, Menu, X, Instagram, Twitter, Facebook } from 'lucide-react'

export default function ShaftLandingPage() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <div className="min-h-screen bg-green-50 text-gray-900">
      {/* Header */}
      <header className="sticky top-0 bg-transparent backdrop-blur-sm shadow-sm z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-green-600 flex items-center">
            <Ship className="mr-2" />
            Shaft
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="hover:text-green-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-green-600 transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-green-600 transition-colors">Pricing</a>
            <a href="#" className="hover:text-green-600 transition-colors">Blog</a>
          </nav>
          <button className="md:hidden" onClick={toggleMenu}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white py-2">
            <a href="#features" className="block px-4 py-2 hover:bg-green-100">Features</a>
            <a href="#how-it-works" className="block px-4 py-2 hover:bg-green-100">How It Works</a>
            <a href="#pricing" className="block px-4 py-2 hover:bg-green-100">Pricing</a>
            <a href="#" className="block px-4 py-2 hover:bg-green-100">Blog</a>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-400 to-green-600 text-white py-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Grow Your Own business, Effortlessly</h1>
            <p className="text-xl mb-8">Shaft: The AI-powered smart  CRM that brings technology into your work</p>
            <button className="bg-white text-green-600 px-6 py-3 rounded-full font-semibold hover:bg-green-100 transition-colors inline-flex items-center">
              <Link href="/dashboard">Get Started</Link>
              <ArrowRight className="ml-2" size={20} />
            </button>
          </div>
          <div className="md:w-1/2">
            <img src="https://static.vecteezy.com/system/resources/previews/019/617/531/original/cargo-ship-illustration-png.png?height=400&width=600" alt="Shaft Smart CRM" className="rounded-lg shadow-l" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Shaft?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Sprout size={40} />}
              title="AI-Powered Growth"
              description="Our AI algorithms ensure optimal growing conditions for each tech."
            />
            <FeatureCard
              icon={<Droplets size={40} />}
              title="Self-Advancing System"
              description="Never worry about over or under-watering your techs again."
            />
            <FeatureCard
              icon={<Sun size={40} />}
              title="Smart LED Lighting"
              description="Provides the perfect spectrum of light for healthy tech growth."
            />
            <FeatureCard
              icon={<Smartphone size={40} />}
              title="Mobile App Control"
              description="Monitor and control your CRM from anywhere with our easy-to-use app."
            />
            <FeatureCard
              icon={<Zap size={40} />}
              title="Energy Efficient"
              description="Uses 90% less water and 60% less energy than traditional CRMing."
            />
            <FeatureCard
              icon={<BarChart size={40} />}
              title="Growth Analytics"
              description="Track your techs' progress and learn from detailed growth analytics."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How Shaft Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <StepCard
              number="1"
              title="Set Up"
              description="Unbox your Shaft, connect to Wi-Fi, and you're ready to go."
            />
            <StepCard
              number="2"
              title="Data"
              description="Insert s into the smart soil - no green thumb required!"
            />
            <StepCard
              number="3"
              title="Grow"
              description="Let Shaft's AI take care of Anything."
            />
            <StepCard
              number="4"
              title="Scale"
              description="Enjoy fresh, workgrown produce right from your workPlace."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-green-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Choose Your Shaft</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <PricingCard
              title="Shaft Mini"
              price="$199"
              features={[
                "Perfect for small spaces",
                "Grows up to 4 techs",
                "Basic mobile app features",
                "1-year warranty"
              ]}
            />
            <PricingCard
              title="Shaft Plus"
              price="$299"
              features={[
                "Ideal for families",
                "Grows up to 9 techs",
                "Advanced mobile app with recipes",
                "2-year warranty",
                "Free s for 3 months"
              ]}
              highlighted={true}
            />
            <PricingCard
              title="Shaft Pro"
              price="$499"
              features={[
                "For serious work CRMers",
                "Grows up to 20 techs",
                "Premium app with AI assistant",
                "5-year warranty",
                "Lifetime  subscription"
              ]}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your  CRM?</h2>
          <p className="text-xl mb-8">Join thousands of happy Shaft users and start growing your own business today.</p>
          <button className="bg-white text-green-600 px-6 py-3 rounded-full font-semibold hover:bg-green-100 transition-colors inline-flex items-center">
            Order Your Shaft
            <ArrowRight className="ml-2" size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-2xl font-bold mb-4 md:mb-0 flex items-center">
              <Ship className="mr-2" />
              Shaft
            </div>
            <nav className="flex space-x-4 mb-4 md:mb-0">
              <a href="#" className="hover:text-green-400 transition-colors">work</a>
              <a href="#" className="hover:text-green-400 transition-colors">About</a>
              <a href="#" className="hover:text-green-400 transition-colors">Contact</a>
              <a href="#" className="hover:text-green-400 transition-colors">Support</a>
            </nav>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-green-400 transition-colors"><Instagram size={24} /></a>
              <a href="#" className="hover:text-green-400 transition-colors"><Twitter size={24} /></a>
              <a href="#" className="hover:text-green-400 transition-colors"><Facebook size={24} /></a>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-400">
            © 2025 Shaft. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="text-green-600 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function StepCard({ number, title, description }) {
  return (
    <div className="bg-green-50 p-6 rounded-lg text-center">
      <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function PricingCard({ title, price, features, highlighted = false }) {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-md ${highlighted ? 'ring-2 ring-green-500 shadow-lg' : ''}`}>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-4xl font-bold mb-6">{price}</p>
      <ul className="mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center mb-2">
            <ArrowRight className="text-green-500 mr-2" size={16} />
            {feature}
          </li>
        ))}
      </ul>
      <button className={`w-full py-2 px-4 rounded-full font-semibold ${
        highlighted 
          ? 'bg-green-600 text-white hover:bg-green-700' 
          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
      } transition-colors`}>
        Choose Plan
      </button>
    </div>
  )
}

