export const SITE = {
    name: "Peak Kinetics",
    url: "https://peakkineticspt.com",
    twitterHandle: "@peakkineticspt",
    address: {
        street: "1 Chisholm Trail, Suite 450",
        city: "Round Rock",
        region: "TX",
        postalCode: "78681",
        country: "US",
    },
    phone: "+1-737-368-2653",
    email: "info@peakkineticspt.com",
} as const

export const SERVICES = [
    {
        slug: "orthopedic-therapy",
        title: "Orthopedic Therapy",
        description:
            "Targeted rehabilitation for joint, ligament, and post-surgical recovery — from rotator cuff to ACL to hip replacement.",
    },
    {
        slug: "pain-management",
        title: "Pain Management",
        description:
            "Evidence-based care for chronic pain conditions, headaches, neck and lumbar pain, and tendinopathy.",
    },
    {
        slug: "sports-rehabilitation",
        title: "Sports Rehabilitation",
        description:
            "Return-to-sport programs, ACL reconstruction recovery, throwing rehab, and performance optimization for athletes.",
    },
    {
        slug: "geriatric-care",
        title: "Geriatric Physical Therapy",
        description:
            "Mobility, balance, and fall-prevention programs designed for older adults — including post-fracture and post-surgical recovery.",
    },
    {
        slug: "wellness-program",
        title: "Wellness Program",
        description:
            "Preventive care, biomechanics screening, and movement education for active adults who want to stay injury-free.",
    },
    {
        slug: "movement-screening",
        title: "Movement Screening",
        description:
            "Comprehensive functional movement assessment to identify dysfunction before it becomes injury.",
    },
] as const

export type ServiceSlug = (typeof SERVICES)[number]["slug"]
