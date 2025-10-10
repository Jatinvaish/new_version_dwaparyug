import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'
import React from 'react'

const Faqsection = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">Frequently Asked Questions</h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 px-4">
            Get answers to common questions about our donation process and platform.
          </p>
        </motion.div>

        <div className="space-y-4 sm:space-y-6">
          {[
            {
              question: "How do I know my donation is being used properly?",
              answer:
                "We provide complete transparency through real-time tracking, regular photo/video updates, impact reports, and direct communication from beneficiaries. You can see exactly how your donation is being utilized.",
            },
            {
              question: "Is my payment information secure?",
              answer:
                "Yes, we use industry-standard 256-bit SSL encryption for all transactions. We never store your payment information on our servers and work with certified payment gateways.",
            },
            {
              question: "Can I get a tax deduction for my donation?",
              answer:
                "As you complete your donation successfully, Please fill in your PAN number, complete address, and name as per PAN and submit. Your 80G certificate will be generated and sent via email within one month.",
            },
            {
              question: "How often will I receive updates about my donation?",
              answer:
                "You'll receive immediate confirmation, weekly progress updates, and detailed impact reports. For larger donations, we also provide personalized updates and site visit opportunities.",
            },
            {
              question: "Can I change or take back my donation?",
              answer:
                "Your money is a donation to a good cause, not a purchase. Once you've donated, the money can't be refunded. The only exception is if we accidentally charge you more than once; if that happens, we'll refund the extra amount.",
            },
          ].map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 gap-3">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">{faq.question}</h3>
                <p className="text-sm sm:text-base text-gray-600">{faq.answer}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Faqsection