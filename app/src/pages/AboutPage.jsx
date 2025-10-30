import React from 'react';

export default function AboutPage() {
  const teamMembers = [
    {
      id: 1,
      name: "Rajesh Kumar",
      position: "Founder & CEO",
      image: "/nimko-1.jpg",
      description: "With over 20 years of experience in the food industry, Rajesh founded Ideal Nimko with a vision to bring authentic Indian flavors to every household.",
      expertise: ["Business Strategy", "Quality Control", "Traditional Recipes"]
    },
    {
      id: 2,
      name: "Priya Sharma",
      position: "Head of Operations",
      image: "/nimko-2.jpg",
      description: "Priya ensures that our production processes maintain the highest standards while scaling our operations efficiently.",
      expertise: ["Operations Management", "Supply Chain", "Quality Assurance"]
    },
    {
      id: 3,
      name: "Amit Patel",
      position: "Master Chef",
      image: "/nimko-3.jpg",
      description: "Amit brings traditional family recipes passed down through generations, ensuring authentic taste in every product.",
      expertise: ["Recipe Development", "Food Safety", "Traditional Cooking"]
    },
    {
      id: 4,
      name: "Sneha Gupta",
      position: "Marketing Director",
      image: "/nimko-1.jpg",
      description: "Sneha leads our marketing efforts to connect with customers and build the Ideal Nimko brand across India.",
      expertise: ["Digital Marketing", "Brand Management", "Customer Relations"]
    },
    {
      id: 5,
      name: "Vikram Singh",
      position: "Sales Manager",
      image: "/nimko-2.jpg",
      description: "Vikram manages our sales network and ensures our products reach every corner of the country.",
      expertise: ["Sales Strategy", "Distribution", "Retail Management"]
    },
    {
      id: 6,
      name: "Anita Joshi",
      position: "Quality Assurance Manager",
      image: "/nimko-3.jpg",
      description: "Anita oversees quality control processes to ensure every product meets our high standards before reaching customers.",
      expertise: ["Quality Control", "Food Safety", "Testing & Analysis"]
    }
  ];

  const milestones = [
    {
      year: "2004",
      title: "Company Founded",
      description: "Started as a small family business with traditional recipes"
    },
    {
      year: "2010",
      title: "First Factory",
      description: "Established our first production facility in Mumbai"
    },
    {
      year: "2015",
      title: "National Expansion",
      description: "Expanded operations to 5 major cities across India"
    },
    {
      year: "2020",
      title: "Digital Transformation",
      description: "Launched online platform and digital ordering system"
    },
    {
      year: "2024",
      title: "Premium Brand",
      description: "Recognized as a premium namkeen brand with nationwide presence"
    }
  ];

  const values = [
    {
      icon: "🏺",
      title: "Traditional Heritage",
      description: "We preserve and honor traditional Indian recipes passed down through generations"
    },
    {
      icon: "⭐",
      title: "Quality First",
      description: "Every product undergoes rigorous quality checks to ensure the highest standards"
    },
    {
      icon: "🌱",
      title: "Natural Ingredients",
      description: "We use only the finest natural ingredients without artificial preservatives"
    },
    {
      icon: "❤️",
      title: "Customer Satisfaction",
      description: "Your happiness is our priority - we strive to exceed expectations"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/nimko-2.jpg')",
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-900/80 to-orange-600/80"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              About Ideal Nimko
            </h1>
            <p className="text-xl md:text-2xl text-white mb-8 max-w-3xl mx-auto">
              Crafting authentic Indian flavors with traditional recipes and modern quality standards
            </p>
          </div>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="w-24 h-1 bg-yellow-500 rounded-full mb-6"></div>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Founded in 2004, Ideal Nimko began as a small family business with a simple mission: 
                to bring authentic Indian namkeen and snacks to every household. What started as 
                traditional recipes passed down through generations has now grown into a trusted 
                brand serving customers across India.
              </p>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Our journey has been driven by a commitment to quality, authenticity, and customer 
                satisfaction. We believe that food is not just sustenance but a connection to our 
                culture, traditions, and loved ones.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Today, we continue to honor our roots while embracing modern production techniques 
                to ensure consistent quality and taste in every product we create.
              </p>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div 
                className="w-full h-96 rounded-lg shadow-xl bg-cover bg-center"
                style={{
                  backgroundImage: "url('/nimko-3.jpg')"
                }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-gradient-to-b from-yellow-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-fade-in-up">Our Values</h2>
            <div className="w-24 h-1 bg-yellow-500 mx-auto rounded-full animate-fade-in-up" style={{ animationDelay: '0.3s' }}></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div 
                key={index}
                className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="text-4xl mb-4 text-center">{value.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">{value.title}</h3>
                <p className="text-gray-600 text-center">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-fade-in-up">Our Journey</h2>
            <div className="w-24 h-1 bg-yellow-500 mx-auto rounded-full animate-fade-in-up" style={{ animationDelay: '0.3s' }}></div>
          </div>
          
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-yellow-500"></div>
            {milestones.map((milestone, index) => (
              <div 
                key={index}
                className={`relative flex items-center mb-12 animate-fade-in-up`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 ml-auto'}`}>
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="text-2xl font-bold text-yellow-600 mb-2">{milestone.year}</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{milestone.title}</h3>
                    <p className="text-gray-600">{milestone.description}</p>
                  </div>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-yellow-500 rounded-full border-4 border-white shadow-lg"></div>
                <div className={`w-1/2 ${index % 2 === 0 ? 'pl-8' : 'pr-8'}`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-fade-in-up">Meet Our Team</h2>
            <div className="w-24 h-1 bg-yellow-500 mx-auto rounded-full animate-fade-in-up" style={{ animationDelay: '0.3s' }}></div>
            <p className="text-lg text-gray-600 mt-6 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              Our dedicated team of professionals works tirelessly to bring you the best quality products and service.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div 
                key={member.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-semibold">{member.name}</h3>
                    <p className="text-yellow-300">{member.position}</p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4 leading-relaxed">{member.description}</p>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">Expertise:</h4>
                    <div className="flex flex-wrap gap-2">
                      {member.expertise.map((skill, skillIndex) => (
                        <span 
                          key={skillIndex}
                          className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 bg-gradient-to-r from-yellow-500 to-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
            <p className="text-xl text-white max-w-4xl mx-auto leading-relaxed">
              "To preserve and share the authentic flavors of India through traditional recipes, 
              while maintaining the highest standards of quality and customer satisfaction. We are 
              committed to bringing families together through the joy of delicious, wholesome snacks 
              that celebrate our rich culinary heritage."
            </p>
            <div className="mt-8">
              <div className="inline-block bg-white text-yellow-600 px-8 py-3 rounded-lg text-lg font-semibold">
                - The Ideal Nimko Family
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Get in Touch</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Have questions about our products or want to learn more about our story? 
              We'd love to hear from you!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/contact" 
                className="bg-yellow-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-yellow-600 hover:scale-105 transform transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Contact Us
              </a>
              <a 
                href="/products" 
                className="bg-gray-800 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-900 hover:scale-105 transform transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                View Products
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
