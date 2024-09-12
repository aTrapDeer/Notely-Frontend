import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from 'framer-motion'

export default function LandingPage() {
  const [hoveredFeature, setHoveredFeature] = useState(null)

  const features = [
    { icon: '🔗', title: 'Smart Note Connections', description: 'Our AI-powered NLP system intelligently connects all your notes, creating a web of knowledge for deeper insights and easier recall.' },
    { icon: '🌍', title: 'Flexible Sharing Options', description: 'Share your brilliance with the world, your organization, or keep it private. You're in control of your knowledge.' },
    { icon: '💾', title: 'Local Storage Control', description: 'Keep your notes close and secure. Save locally to your machine for complete data control and offline access.' },
    { icon: '🧠', title: 'AI Training Management', description: 'Curate and manage the notes and data you've used to train our AI, ensuring your digital brain evolves with you.' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900">
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-24"
        >
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">NoteGenius: Your AI-Powered Note-Taking Companion</h1>
          <p className="text-xl text-gray-600 mb-10">Revolutionize your note-taking experience with AI-driven insights and seamless organization</p>
          <Button className="text-lg px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-200">Try For Free Now</Button>
        </motion.header>

        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-24"
        >
          <h2 className="text-3xl font-semibold text-center mb-12">Choose Your Plan</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {['Free Version', 'Premium Version'].map((plan, index) => (
              <Card key={plan} className="overflow-hidden transition-all duration-200 hover:shadow-lg">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">{plan}</h3>
                  <p className="text-gray-600 mb-6">{index === 0 ? 'Get started with limited access to our amazing features' : 'Unlock the full potential of NoteGenius'}</p>
                  <ul className="space-y-2 mb-6">
                    {index === 0 ? 
                      ['Basic AI-powered note organization', 'Up to 100 notes storage', 'Personal use only'].map((feature, i) => (
                        <li key={i} className="flex items-center"><span className="text-green-500 mr-2">✓</span>{feature}</li>
                      )) :
                      ['Advanced AI features', 'Unlimited note storage', 'Collaboration tools', 'Priority support'].map((feature, i) => (
                        <li key={i} className="flex items-center"><span className="text-green-500 mr-2">✓</span>{feature}</li>
                      ))
                    }
                  </ul>
                  <p className="font-semibold text-xl">{index === 0 ? 'Free' : '$10/month'}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-3xl font-semibold text-center mb-12">Features That Set Us Apart</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="p-6 rounded-lg transition-all duration-200"
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                onHoverStart={() => setHoveredFeature(index)}
                onHoverEnd={() => setHoveredFeature(null)}
              >
                <span className="text-4xl mb-4 inline-block">{feature.icon}</span>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.footer 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-24"
        >
          <p className="text-gray-600 mb-6">Perfect for students 📚, businesses 💼, and personal use 🏠</p>
          <Button className="text-lg px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-200">Start Your Free Trial Today!</Button>
        </motion.footer>
      </div>
    </div>
  )
}