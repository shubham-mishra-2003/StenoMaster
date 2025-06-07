import React, { useState } from "react";
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
import LoginForm from "@/components/auth/LoginForm";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/hooks/ThemeProvider";
import Image from "next/image";

const LandingPage = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

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

  const { colorScheme } = useTheme();

  return (
    <div
      className={`min-h-screen text-white dark:text-black bg-gradient-to-br ${
        colorScheme == "dark"
          ? "from-slate-900 via-blue-950/30 to-purple-950/30"
          : "from-slate-50 via-blue-50/80 to-purple-50/80"
      }`}
    >
      <nav
        className={`border-b border-border/50 bg-gradient-to-r backdrop-blur-xl sticky top-0 z-50 ${
          colorScheme == "dark"
            ? "from-gray-900/90 via-blue-950/50 to-purple-950/50"
            : "from-white/90 via-blue-50/50 to-purple-50/50"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg">
                <Image src="/logo.png" alt="Logo" width={50} height={35} />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold gradient-text">
                StenoLearn
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                <DialogTrigger asChild>
                  <Button
                    className={`bg-gradient-to-r shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
                      colorScheme == "dark"
                        ? "dark-gradient-button"
                        : "light-gradient-button"
                    }`}
                  >
                    Login
                  </Button>
                </DialogTrigger>
                <DialogContent
                  className={`max-h-[90vh] flex flex-col max-w-[90%] sm:max-w-md bg-gradient-to-br backdrop-blur-xl border-0 shadow-2xl ${
                    colorScheme == "dark"
                      ? "modal-gradient-dark-bg"
                      : "modal-gradient-light-bg"
                  }`}
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
                className={`text-lg sm:text-xl mb-8 max-w-4xl mx-auto font-bold leading-relaxed ${
                  colorScheme == "dark" ? "text-dark" : "text-light"
                }`}
              >
                A comprehensive platform for learning stenography with real-time
                feedback, progress tracking, and interactive assignments
                designed for both teachers and students.
              </p>
              <Button
                size="lg"
                className="gradient-button"
                onClick={() => setIsLoginOpen(true)}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        className={`py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r backdrop-blur-sm ${
          colorScheme == "dark"
            ? "from-gray-900/60 via-blue-950/40 to-purple-950/40"
            : "from-white/60 via-blue-50/40 to-purple-50/40"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4 gradient-text">
              Why Choose StenoLearn?
            </h3>
            <p
              className={`text-lg sm:text-xl ${
                colorScheme == "dark" ? "text-dark" : "text-light"
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
                  className={`relative overflow-hidden bg-gradient-to-br backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group ${
                    colorScheme == "dark"
                      ? "from-gray-900/80 via-gray-800/60 to-gray-700/40"
                      : "from-white/80 via-white/60 to-white/40"
                  }`}
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
                          colorScheme == "dark" ? "text-dark" : "text-light"
                        }`}
                      >
                        {feature.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <p
                      className={`leading-relaxed ${
                        colorScheme == "dark" ? "text-dark" : "text-light"
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
            className={`relative overflow-hidden bg-gradient-to-br backdrop-blur-xl border-0 shadow-2xl ${
              colorScheme == "dark"
                ? "from-gray-900/80 via-blue-950/60 to-purple-950/60"
                : "from-white/80 via-blue-50/60 to-purple-50/60"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10"></div>
            <CardContent className="py-12 sm:py-16 relative z-10">
              <h3 className="text-2xl sm:text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Ready to Start Learning?
              </h3>
              <p
                className={`text-lg sm:text-xl mb-8 leading-relaxed ${
                  colorScheme == "dark" ? "text-dark" : "text-light"
                }`}
              >
                Join thousands of students and teachers already using StenoLearn
                to master stenography
              </p>
              <Button
                size="lg"
                className="gradient-button"
                onClick={() => setIsLoginOpen(true)}
              >
                Login to Your Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`border-t border-border/50 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-r backdrop-blur-sm ${
          colorScheme == "dark"
            ? "from-gray-900/60 via-blue-950/40 to-purple-950/40"
            : "from-white/60 via-blue-50/40 to-purple-50/40"
        }`}
      >
        <div className="max-w-7xl mx-auto text-center">
          <p
            className={`${
              colorScheme == "dark" ? "text-dark" : "text-light"
            } font-bold`}
          >
            © 2024 StenoLearn. Built for educational excellence.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
