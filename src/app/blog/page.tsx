"use client";

import { Card } from "@/components/ui/card";
import { BookOpen, Calendar, User, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function BlogPage() {
  const blogPosts = [
    {
      id: 1,
      title: "Finding the Best Airport Parking: Tips and Tricks",
      excerpt: "Discover how to find the most convenient and affordable airport parking options for your next trip.",
      author: "Jane Smith",
      date: "June 10, 2023",
      category: "Tips & Tricks"
    },
    {
      id: 2,
      title: "5 Common Mistakes to Avoid When Booking Airport Parking",
      excerpt: "Learn about the pitfalls many travelers encounter when booking airport parking and how to avoid them.",
      author: "Robert Johnson",
      date: "May 24, 2023",
      category: "Guides"
    },
    {
      id: 3,
      title: "The Future of Airport Parking: Trends to Watch",
      excerpt: "Explore upcoming trends in the airport parking industry and how technology is changing the parking experience.",
      author: "Alex Chen",
      date: "May 15, 2023",
      category: "Industry News"
    },
    {
      id: 4,
      title: "How to Save Money on Long-Term Airport Parking",
      excerpt: "Strategic tips to help you find the best deals on long-term parking for extended trips.",
      author: "Maria Garcia",
      date: "April 30, 2023",
      category: "Tips & Tricks"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold mb-6">Blog</h1>
        <p className="text-xl text-muted-foreground">
          Latest news, guides, and insights about airport parking
        </p>
      </div>

      <div className="max-w-5xl mx-auto mb-16">
        <div className="grid md:grid-cols-2 gap-8">
          {blogPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden flex flex-col">
              <div className="bg-gray-100 h-48 flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-primary/30" />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="text-sm text-primary font-medium mb-2">{post.category}</div>
                <h3 className="text-xl font-semibold mb-3">{post.title}</h3>
                <p className="text-muted-foreground mb-4 flex-grow">{post.excerpt}</p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="w-4 h-4 mr-1" />
                    {post.author}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-1" />
                    {post.date}
                  </div>
                </div>
                <Link 
                  href={`/blog/${post.id}`} 
                  className="mt-4 text-primary flex items-center hover:underline font-medium"
                >
                  Read more <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 