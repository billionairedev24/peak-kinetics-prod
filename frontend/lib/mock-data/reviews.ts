export interface Review {
  id: string
  name: string
  role: string
  text: string
  fullText?: string
  rating: number
  image?: string
  date: string
  treatment?: string
}

export const mockReviews: Review[] = [
  {
    id: "1",
    name: "Sarah Mitchell",
    role: "Marathon Runner",
    text: "After months of chronic knee pain, Peak Kinetics got me back to running pain-free. Their personalized approach made all the difference!",
    fullText:
      "After months of chronic knee pain that kept me from training, I found Peak Kinetics. From the very first session, I knew I was in expert hands. The team took time to understand not just my injury, but my goals as a marathon runner. Through a combination of manual therapy, targeted exercises, and education on proper form, they got me back to running pain-free within 8 weeks. What impressed me most was their personalized approach - every session was tailored to my progress. I'm now training for my next marathon with confidence!",
    rating: 5,
    image: "/young-female-athlete-headshot.jpg",
    date: "2 weeks ago",
    treatment: "Sports Rehabilitation",
  },
  {
    id: "2",
    name: "Michael Chen",
    role: "Construction Worker",
    text: "The team here truly cares. My back injury was affecting my work and family life. Now I'm stronger than ever!",
    fullText:
      "I injured my back on a construction site and was told I might need surgery. Before making that decision, I came to Peak Kinetics for a second opinion. Best decision I ever made! They developed a comprehensive treatment plan that addressed the root cause of my pain, not just the symptoms. Through manual therapy, core strengthening, and movement re-education, I avoided surgery completely. Not only am I back to work full-time, but I'm actually stronger and more aware of my body mechanics than before the injury. The team here truly cares about their patients and goes above and beyond.",
    rating: 5,
    image: "/middle-aged-construction-worker-headshot.jpg",
    date: "1 month ago",
    treatment: "Pain Management",
  },
  {
    id: "3",
    name: "Robert Johnson",
    role: "Retiree",
    text: "At 72, I thought my mobility issues were just part of aging. Peak Kinetics proved me wrong. I'm now more active than I've been in years!",
    fullText:
      "At 72 years old, I had accepted that stiffness, balance issues, and limited mobility were just part of getting older. My daughter convinced me to try Peak Kinetics, and I'm so glad she did. The therapists specialized in geriatric care took a patient, understanding approach. They never pushed too hard but consistently challenged me to improve. Through balance training, flexibility work, and strength building, I've regained abilities I thought were gone forever. I can now play with my grandchildren, garden, and even started playing golf again. They didn't just treat my symptoms - they gave me my independence and quality of life back.",
    rating: 5,
    image: "/elderly-man-smiling-headshot.jpg",
    date: "3 weeks ago",
    treatment: "Geriatric Care",
  },
  {
    id: "4",
    name: "Jennifer Adams",
    role: "Busy Mom",
    text: "Balancing three kids and chronic shoulder pain was impossible. The team worked around my schedule and had me pain-free in weeks.",
    fullText:
      "As a mother of three young children, I was struggling with chronic shoulder pain that made everything from lifting my toddler to doing household chores painful. I kept putting off treatment because I couldn't find time. Peak Kinetics worked with my busy schedule, offering early morning and evening appointments. The therapists were efficient but thorough, and they taught me exercises I could do at home while watching the kids. Within 6 weeks, my shoulder pain was completely gone. They also educated me on body mechanics for daily activities, which has prevented other issues from developing. I'm so grateful for their flexibility and expertise!",
    rating: 5,
    image: "/young-mother-headshot.jpg",
    date: "2 months ago",
    treatment: "Orthopedic Therapy",
  },
  {
    id: "5",
    name: "David Martinez",
    role: "Competitive Cyclist",
    text: "The movement screening identified issues I didn't even know I had. Now my performance has improved significantly!",
    fullText:
      "I came to Peak Kinetics for a movement screening before my cycling season began. I thought I was in great shape, but the comprehensive assessment revealed several muscular imbalances and movement compensations that were limiting my performance and putting me at risk for injury. The therapists created a targeted program to address these issues. After following their recommendations for just 8 weeks, my power output increased, I'm more comfortable on long rides, and I feel more balanced on the bike. The screening was worth every penny - it's like getting an advantage over my competition while also protecting my body. Highly recommend to any serious athlete!",
    rating: 5,
    image: "/middle-aged-man-athlete-headshot.jpg",
    date: "1 month ago",
    treatment: "Movement Screening",
  },
  {
    id: "6",
    name: "Emily Rodriguez",
    role: "Office Professional",
    text: "Years of desk work led to neck and shoulder problems. The wellness program has been life-changing!",
    fullText:
      "After 15 years of desk work, I developed chronic neck pain, shoulder tension, and headaches that were affecting my productivity and quality of life. I tried various treatments with limited success until I discovered Peak Kinetics' Wellness Program. It's not just about treating pain - it's about building a sustainable, healthy lifestyle. They taught me proper ergonomics, gave me exercises to do throughout my workday, and helped me build strength and flexibility. The holistic approach addressed not just my symptoms but the root causes. Six months later, I'm pain-free, have more energy, and feel stronger than I did in my twenties. This program is a game-changer for anyone with a desk job!",
    rating: 5,
    image: "/professional-woman-headshot.png",
    date: "3 months ago",
    treatment: "Wellness Program",
  },
]
