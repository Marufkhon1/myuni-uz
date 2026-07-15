import { motion } from "framer-motion";
import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { SUPPORT_EMAIL } from "@/config/siteContact.js";
import { trackHubCta } from "@/lib/analytics.js";
import usePublicFaqItems from "../hooks/usePublicFaqItems.js";



function FaqSkeletonList() {

  return (

    <div className="space-y-3">

      {[0, 1, 2, 3].map((item) => (

        <div

          key={item}

          className="h-16 animate-pulse rounded-[1.35rem] border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/[0.04]"

        />

      ))}

    </div>

  );

}



export default function FAQSection() {

  const baseId = useId();

  const { items, loading, error } = usePublicFaqItems();

  const [openIndex, setOpenIndex] = useState(0);



  return (

    <section id="faq" className="section-padding">

      <div className="container-shell">

        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">

          <div className="max-w-xl">

            <span className="eyebrow">Ko&apos;p so&apos;raladigan savollar</span>

            <h2 className="mt-5 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl dark:text-white">

              Savollaringiz bormi? Javoblar shu yerda.

            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">

              Platformadan foydalanish, sharhlar va chat haqida eng ko&apos;p beriladigan savollarga

              qisqa javoblar.

            </p>

            <div className="mt-8 rounded-[1.75rem] border border-slate-200 bg-slate-50/80 p-5 transition hover:border-primary/25 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-primary/30">

              <p className="text-sm font-black uppercase tracking-[0.16em] text-primary">

                Yana savol bormi?

              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Kabinet ichidagi yordamchi chat-bot,{" "}
                <Link
                  to="/aloqa"
                  onClick={() => trackHubCta("/aloqa", "landing_faq")}
                  className="font-black text-primary transition hover:text-blue-700 hover:underline dark:hover:text-blue-200"
                >
                  aloqa sahifasi
                </Link>{" "}
                yoki{" "}
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="font-black text-primary transition hover:text-blue-700 hover:underline dark:hover:text-blue-200"
                >
                  {SUPPORT_EMAIL}
                </a>{" "}
                orqali biz bilan bog&apos;laning.
              </p>

              <Link

                to="/savollar-javob"

                className="btn-modal-gradient mt-4 inline-flex rounded-full px-5 py-2.5 text-sm"

              >

                Barcha savollar

              </Link>

            </div>

          </div>



          <div className="space-y-3">

            {loading ? <FaqSkeletonList /> : null}



            {!loading && error ? (

              <p className="rounded-[1.35rem] border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">

                {error}{" "}

                <Link to="/savollar-javob" className="font-black underline">

                  To&apos;liq sahifani oching

                </Link>

                .

              </p>

            ) : null}



            {!loading && !error && items.length === 0 ? (

              <p className="rounded-[1.35rem] border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">

                Hozircha savollar qo&apos;shilmagan.{" "}

                <Link to="/savollar-javob" className="font-black text-primary underline">

                  Savol-javob sahifasi

                </Link>

                .

              </p>

            ) : null}



            {!loading && !error

              ? items.map((item, index) => {

                  const isOpen = openIndex === index;

                  const panelId = `${baseId}-faq-${item.slug || index}`;



                  return (

                    <motion.div

                      key={item.slug || item.question}

                      initial={{ opacity: 0, y: 16 }}

                      whileInView={{ opacity: 1, y: 0 }}

                      viewport={{ once: true, amount: 0.2 }}

                      transition={{ delay: index * 0.04, duration: 0.45 }}

                      className={`faq-item ${isOpen ? "faq-item--open" : ""}`}

                    >

                      <button

                        type="button"

                        id={`${panelId}-trigger`}

                        onClick={() => setOpenIndex(isOpen ? -1 : index)}

                        className="faq-trigger"

                        aria-expanded={isOpen}

                        aria-controls={panelId}

                      >

                        <span className="text-base font-black text-slate-950 dark:text-white sm:text-lg">

                          {item.question}

                        </span>

                        <span

                          className={`faq-toggle ${isOpen ? "faq-toggle--open" : ""}`}

                          aria-hidden="true"

                        >

                          <svg

                            viewBox="0 0 24 24"

                            className="faq-toggle-icon"

                            fill="none"

                            stroke="currentColor"

                            strokeWidth="2.5"

                            strokeLinecap="round"

                            aria-hidden="true"

                          >

                            <path d="M12 5v14M5 12h14" />

                          </svg>

                        </span>

                      </button>

                      <div

                        id={panelId}

                        role="region"

                        aria-labelledby={`${panelId}-trigger`}

                        aria-hidden={!isOpen}

                        className={`faq-panel ${isOpen ? "faq-panel--open" : ""}`}

                      >

                        <div className="faq-panel-inner">

                          <div className="faq-panel-content">

                            <p>{item.answer}</p>

                          </div>

                        </div>

                      </div>

                    </motion.div>

                  );

                })

              : null}

          </div>

        </div>

      </div>

    </section>

  );

}


