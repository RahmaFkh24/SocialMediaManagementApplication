
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Zap, CheckCircle, Users, BarChart2, Bot, Repeat, Users2, Rocket, Star } from 'lucide-react';
import LandingHeader from '@/components/LandingHeader'; // Import Header
import LandingFooter from '@/components/LandingFooter'; // Import Footer


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
};

const featureVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 120, damping: 10 } },
  hover: { scale: 1.05, transition: { duration: 0.2 } }
};

const testimonialVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};


const features = [
  { icon: Zap, title: "Smart Scheduling", description: "Post across LinkedIn, Instagram, Facebook, TikTok, YouTube, Reddit, and more." },
  { icon: Bot, title: "AI Assistant", description: "Generate text, captions, and post ideas quickly with our integrated AI." },
  { icon: Repeat, title: "Automation", description: "Automate repetitive tasks to save time and focus on strategy." },
  { icon: BarChart2, title: "Performance Analytics", description: "Track detailed statistics to understand your impact." },
  { icon: Users2, title: "Team Collaboration", description: "Create and approve content together seamlessly." },
];

const testimonials = [
  { quote: "Social Pulse revolutionized how we manage our clients' accounts. The AI writer is a lifesaver!", author: "Marketing Agency Owner" },
  { quote: "Finally, a tool that brings all my platforms together. Scheduling is so much easier now.", author: "Freelance Content Creator" },
  { quote: "The analytics are clear and actionable. We've seen a real improvement in engagement.", author: "Startup Founder" },
];


const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen"> {/* Wrapper div for flex layout */}
      <LandingHeader /> {/* Add Header */}
      <motion.main /* Changed div to main for semantics */
        className="flex-grow flex flex-col items-center p-6 pt-24 md:pt-32 bg-gradient-to-b from-background via-purple-50 dark:via-purple-900/10 to-blue-50 dark:to-blue-900/10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <motion.section variants={itemVariants} className="text-center max-w-4xl mx-auto mb-20 md:mb-32">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 150 }}
            className="mb-6"
          >
            <Zap className="h-16 w-16 md:h-20 md:w-20 text-primary inline-block p-3 bg-primary/10 rounded-full shadow-lg" />
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-600 to-pink-600">
            🎯 Welcome to Social Pulse!
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Social Pulse is the all-in-one solution to effectively manage all your social media accounts. Create, schedule, organize, analyze, and automate your posts from one place.
          </p>
          <Link to="https://buy.stripe.com/test_7sYaEWgSD8cOcWF8Lz2oE00">
            <Button size="lg" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg transform hover:scale-105 transition-transform duration-300">
              <Rocket className="mr-2 h-5 w-5" /> Start Your 7-Day Free Trial
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-3">No credit card required!</p>
        </motion.section>

        {/* Features Section */}
        <motion.section variants={itemVariants} className="w-full max-w-6xl mx-auto mb-20 md:mb-32 px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">✨ Main Features</h2>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={featureVariants} whileHover="hover">
                <Card className="h-full text-center shadow-lg hover:shadow-primary/20 transition-shadow duration-300 bg-card/80 backdrop-blur-sm border-primary/10">
                  <CardHeader>
                    <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Testimonials Section */}
        <motion.section variants={itemVariants} className="w-full max-w-5xl mx-auto mb-20 md:mb-32 px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">💬 What Users Say</h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div key={index} variants={testimonialVariants}>
                <Card className="h-full flex flex-col justify-between bg-gradient-to-br from-secondary/50 to-background dark:from-secondary/20 dark:to-card border p-6 rounded-xl shadow-md">
                  <blockquote className="italic text-muted-foreground mb-4">"{testimonial.quote}"</blockquote>
                  <footer className="text-sm font-semibold text-primary flex items-center">
                    <Star className="h-4 w-4 mr-1.5 fill-yellow-400 text-yellow-500" />
                    {testimonial.author}
                  </footer>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>


        {/* Target Audience & Benefits Section */}
        <motion.section variants={itemVariants} className="w-full max-w-4xl mx-auto mb-20 md:mb-32 px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">👤 Designed For</h2>
          <p className="text-lg text-muted-foreground mb-10">
            Social media managers, content creators, freelancers, startups, and agencies.
          </p>

          <h2 className="text-3xl md:text-4xl font-bold mb-6">👍 Why Choose Social Pulse?</h2>
          <div className="flex flex-wrap justify-center gap-4 text-lg text-primary">
            <span className="flex items-center bg-primary/10 px-3 py-1 rounded-full"><CheckCircle className="h-5 w-5 mr-2 text-green-500" /> Save time</span>
            <span className="flex items-center bg-primary/10 px-3 py-1 rounded-full"><CheckCircle className="h-5 w-5 mr-2 text-green-500" /> Improve engagement</span>
            <span className="flex items-center bg-primary/10 px-3 py-1 rounded-full"><CheckCircle className="h-5 w-5 mr-2 text-green-500" /> Optimize content</span>
            <span className="flex items-center bg-primary/10 px-3 py-1 rounded-full"><CheckCircle className="h-5 w-5 mr-2 text-green-500" /> Work efficiently</span>
          </div>
        </motion.section>

        {/* Final CTA */}
        <motion.section variants={itemVariants} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Boost Your Social Media?</h2>
          <Link to="/signup">
            <Button size="lg" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg transform hover:scale-105 transition-transform duration-300">
              <Rocket className="mr-2 h-5 w-5" /> Get Started Free for 7 Days
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-3">No credit card required. Cancel anytime.</p>
        </motion.section>

      </motion.main>
      <LandingFooter />

    </div>
  );
};

export default LandingPage;
