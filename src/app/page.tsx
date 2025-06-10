"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  Users,
  Target,
  Award,
  GraduationCap,
  Clock,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import LoginForm from "@/components/LoginForm";
import { useTheme } from "@/hooks/ThemeProvider";

interface LandingPageProps {
  initialShowLogin?: boolean;
}

const page: React.FC<LandingPageProps> = ({ initialShowLogin = false }) => {
  const { colorScheme } = useTheme();
  const [isLoginOpen, setIsLoginOpen] = useState(initialShowLogin);

  useEffect(() => {
    setIsLoginOpen(initialShowLogin);
  }, [initialShowLogin]);

  const features = [
    {
      icon: BookOpen,
      title: "Interactive Assignments",
      description:
        "Practice with real stenography assignments uploaded by your teachers",
      gradient: "from-blue-500 to-purple-500",
    },
    {
      icon: Users,
      title: "Class Management",
      description:
        "Teachers can create classes and manage students efficiently",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Target,
      title: "Real-time Feedback",
      description:
        "Get instant accuracy and WPM feedback on your typing practice",
      gradient: "from-green-500 to-teal-500",
    },
    {
      icon: Award,
      title: "Progress Tracking",
      description: "Monitor your improvement over time with detailed analytics",
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: Clock,
      title: "Timed Practice",
      description:
        "Practice with time constraints to improve speed and accuracy",
      gradient: "from-indigo-500 to-blue-500",
    },
    {
      icon: GraduationCap,
      title: "Educational Focus",
      description:
        "Designed specifically for stenography education and learning",
      gradient: "from-violet-500 to-purple-500",
    },
  ];

  return (
    <div
      className={`min-h-screen ${
        colorScheme === "dark" ? "gradient-card-dark" : "gradient-card-light"
      }`}
    >
      {/* Navigation */}
      <nav
        className={`border-b border-border/50 ${
          colorScheme === "dark"
            ? "gradient-section-dark"
            : "gradient-section-light"
        } backdrop-blur-xl sticky top-0 z-50`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold gradient-text">
                StenoMaster
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-button">Login</Button>
                </DialogTrigger>
                <DialogContent
                  className={`max-w-sm sm:max-w-md mx-4 ${
                    colorScheme === "dark"
                      ? "gradient-card-dark"
                      : "gradient-card-light"
                  } backdrop-blur-xl border-0 shadow-2xl`}
                >
                  <DialogHeader>
                    <DialogTitle className="text-xl gradient-text font-bold text-center">
                      Welcome Back
                    </DialogTitle>
                  </DialogHeader>
                  <LoginForm />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20 blur-3xl"></div>
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 gradient-text leading-tight">
                Master Stenography
                <br />
                <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
                  with Interactive Learning
                </span>
              </h2>
              <p
                className={`text-lg sm:text-xl ${
                  colorScheme === "dark" ? "text-white" : "text-black"
                } mb-8 max-w-3xl mx-auto leading-relaxed`}
              >
                A comprehensive platform for learning stenography with real-time
                feedback, progress tracking, and interactive assignments
                designed for both teachers and students.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="gradient-button"
                  onClick={() => setIsLoginOpen(true)}
                >
                  Get Started
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className={`text-base sm:text-lg px-6 sm:px-8 py-3 border-2 border-gradient-to-r from-blue-500 to-purple-500 hover:bg-gradient-to-r ${
                    colorScheme === "dark"
                      ? "hover:from-blue-950 hover:to-purple-950"
                      : "hover:from-blue-50 hover:to-purple-50"
                  } transition-all duration-300`}
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        className={`py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 ${
          colorScheme === "dark"
            ? "gradient-section-dark"
            : "gradient-section-light"
        } backdrop-blur-sm`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4 gradient-text">
              Why Choose StenoMaster?
            </h3>
            <p
              className={`text-lg sm:text-xl ${
                colorScheme === "dark" ? "text-white" : "text-black"
              }`}
            >
              Everything you need to excel in stenography education
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className={`relative overflow-hidden ${
                    colorScheme === "dark"
                      ? "gradient-card-dark"
                      : "gradient-card-light"
                  } backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}
                  ></div>
                  <CardHeader className="relative z-10">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-3 rounded-lg bg-gradient-to-br ${feature.gradient} shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle
                        className={`text-lg sm:text-xl ${
                          colorScheme === "dark"
                            ? "gradient-card-title-dark"
                            : "gradient-card-title-light"
                        }`}
                      >
                        {feature.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <p
                      className={`leading-relaxed ${
                        colorScheme === "dark" ? "text-white" : "text-black"
                      }`}
                    >
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card
            className={`relative overflow-hidden ${
              colorScheme === "dark"
                ? "gradient-card-cta-dark"
                : "gradient-card-cta-light"
            } backdrop-blur-xl border-0 shadow-2xl`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10"></div>
            <CardContent className="py-12 sm:py-16 relative z-10">
              <h3 className="text-2xl sm:text-3xl font-bold mb-4 gradient-text">
                Ready to Start Learning?
              </h3>
              <p
                className={`text-lg sm:text-xl ${
                  colorScheme === "dark" ? "text-white" : "text-black"
                } mb-8 leading-relaxed`}
              >
                Join thousands of students and teachers already using
                StenoMaster to master stenography
              </p>
              <Button
                size="lg"
                className="gradient-button"
                onClick={() => setIsLoginOpen(true)}
              >
                Login to Your Account
              </Button>
              <p
                className={`text-sm ${
                  colorScheme === "dark" ? "text-white" : "text-black"
                } mt-4`}
              >
                Demo: teacher@demo.com / password
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`border-t border-border/50 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 ${
          colorScheme === "dark"
            ? "gradient-section-dark"
            : "gradient-section-light"
        } backdrop-blur-sm`}
      >
        <div className="max-w-7xl mx-auto text-center">
          <p
            className={`${
              colorScheme === "dark" ? "text-white" : "text-black"
            }`}
          >
            © 2024 StenoMaster. Built for educational excellence.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default page;
