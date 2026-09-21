"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { BlogPost } from "@/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -6 }}
      className="group bg-card-bg rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
    >
      <Link href={`/blog/${post.slug}`}>
        <div className="relative overflow-hidden aspect-[16/10]">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-semibold px-3 py-1.5 rounded-full text-foreground">
            {post.category}
          </div>
          <div className="absolute top-3 right-3 bg-accent/90 backdrop-blur-sm text-xs font-medium px-3 py-1.5 rounded-full text-white">
            {post.readTime}
          </div>
        </div>
        <div className="p-5">
          <p className="text-xs text-muted mb-2">
            {post.createdAt ?? post.date}
          </p>
          <h3 className="font-bold text-foreground text-lg mb-2 line-clamp-2 group-hover:text-accent transition-colors">
            {post.title}
          </h3>
          <p className="text-muted text-sm mb-4 line-clamp-2">{post.excerpt}</p>
          <span className="text-accent font-semibold text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all">
            Read More
            <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
