'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Link2, CheckCircle, XCircle, Loader2, AlertCircle, CheckCircle2, Bot, X, Key, Globe, Copy, Check, ExternalLink } from 'lucide-react'

const PLATFORM_SVGS: Record<string, string> = {
  whatsapp: `<svg viewBox="0 0 24 24" fill="none"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="currentColor"/></svg>`,
  instagram: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" fill="currentColor"/></svg>`,
  facebook: `<svg viewBox="0 0 24 24" fill="none"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="currentColor"/></svg>`,
  telegram: `<svg viewBox="0 0 24 24" fill="none"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" fill="currentColor"/></svg>`,
  trendyol: `<img alt="Trendyol" src="data:image/png;base64,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" style="width:100%;height:100%;object-fit:contain" />`,
  hepsiburada: `<img alt="Hepsiburada" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAC0ElEQVRYhb2XwUsUURzHPzMb1oi5YrKmyBKIhz1VF8EkPHaIqKsdysBD0CU8RFFRIaR0KKJTIER28OQhWP+AEKG62F4aoYSQJVHK3AKnpGU6/N4wszNvZ3djZ78w7L73+773+/L7/d5v3hjuBFkE88AocIBk8RdYAS4BmGryPTAGpBJ2jvIxpnxiAnNAr1JmtECAoXz1AnMmEnZIPvRBeL5GTcBqoeMwLJPWhL0ajGjYy4H/9ZRko/wQogLSgYw4v6Hsxu/QKL+qgLLa7MEaWGmZezgC6zYc1KwM8600PD0Hy3noMuoWEo2At1kQKVUmuk11fG9NHSLqO3p7LuwDbUg04jZvU0L/qHENfm0B+0AuBz2D8G0dirYI0qXF4x+xYOCYjDfXYNeFw3p6vICeQbg9AyfP+3PFAjwfB9uGDs2aKzNw9qY/3tmAV9fgXV4r2nAnkNh4RfVoU3LqlOTpzkZXOSW40SdV/+yHXwM7G3o+wMIULD6JFKipZyObdmdhaVaqe2m20nbqajSv3VmJ0MKU8J2Sb7twD/os2K9cE5+CpVl4cUsKazkP/Tk/HZ2ZKL9YgLsn4Jcav52H6Y+VokNRqB4Bb4M2oF0dw6+2b2vXHL3ll+K8y5DHtmH1tW8/OhRZEi+gUWx/EsFBBEV39Scs4D/QXAGZIekDQfTn/P/BaCQi4PRlyf2uK08uV9lDPq9EljT3FjRwHO6vSjF2ZmDkom8rFuBDXjpi4Pg2V0CxICLGH0dti3fk/dBu1BAQbB5h/Nz27XulSr6VFieZIThz3e+O379I6163I84h2Io9dMRcMFKh21vZjfJ3XakD65AS4MivxjnoIlByAg5DtrLrX8FSVfhel/PmG34d17rXhe06keH5mIuJCTR2iWsuXBNwatKSg2MiH4ogn0utgudrxQQmgS2kHlqRDlf52gImvVY8DLyh8jMjKZSVr2GAf7El5ZY5ZJ39AAAAAElFTkSuQmCC" style="width:100%;height:100%;object-fit:contain" />`,
  n11: `<img alt="n11" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAMAAABrrFhUAAAATlBMVEVHcEwbHB3/RO7/RO8cHB3/RO7/RO4bHB3/RO4cHB4cHB7///8KGAz/NO4BAQNJSUqWlpf37/b/0PrbPM3/pPauNKP/dPJ7K3S6ubpMI0kAwWXTAAAACnRSTlMA01b/JtAnoppe5zFMfQAAC+dJREFUeJztnW17qrwShau22lKKWmvV//9HNy++BJLMJJkFGbpd58u5nl0K62ZlJkCgLy9PPfXUU09NqfV6uXx/f39rtKp1XNTabDYfH6+vuY9tXK1r363lvi6FqUUDIveR4lV7d1hvdSgLWzWGv0PB773V0QXgRiH3sYu1ps03OnkBdBBmnITlO2e+Eem/1TyDsGRPPVEC7CDMjEGo+xVVAmabg3VQ8qMBNAzmUA8iTn4rugbObihEnfxWlygATQxye/QrLvs3AJH+C7UjIcl+SBecB4JE+4kA9CFItZ8MQFctSLcvAKAHwVJgXwSgKDQ0xXVk3x9K4r+eF2QvBZL0t0pogz3lHQey9LeKmwm6lHEcCNMPAlAsMtkHnP5V3MWQrhCIR3+nsPsBnKavBGuM/ZWwDz40cTv4OMAASNvATZMOg0VRHlEAAFWwVTldLXxtdldeQCHAFIFWEw2DjytxVAhwAKYZBpv77soTBABqDDSaoBtsjN2VBWIYAMfABAQW/f2VCAJA/2X5Nqr9V3uHgEIAmQxej6celesJ/ReYQgAE0CRyNAIu/xACsAiUl/b3jUTA7R9CAAbgWpJGIfDh362YACgCjwNZ4v37zj+GAOaCoHz8QjgByn8hvzKAzAV6RwEeBbR/QDcETAevFXAUAoz/AjAjin5Iah/C4DcCCfD+6wwIAYg7gX0KcASC9n9xuYqQsAy4BiHK/4LffQFoBaJe6Nw76Lpgw+++OwZpGRAQ8NCHEAj1b1eh6Qh40/cu9++fAIYfxtgEiB2LJ0QBDeBxHPK7A0mVkJyESFtB3JEUUgCrQxGLgMMu8x/WAB4HA7g9EjknZNuvqBBGFIDr4cgBRIUgZA4uKAMxBeB6PJAbxacyEEHYw4n0MhDrvwDdJV0dQhCEP5tJ9R8+AzCOCvOsgEcQ82gqcTYQXQC6A4M9Nj0WXgb1P5xi9pNWBpL8wyLQ6HC8lOWQQhnrvlGK/8gO+DhAHIBGx9Ol8XxTcTkdEzKW0AvTBkCBmQsMdTgcjvX/DunDK34QpPpHTAfHUKz/lA5wI4BbPQJUZCeIngKZAIBlEKi46VBqBWwBgMsgSFF1MLkCdgRGKIMAxdRBkX+tYyCiDgoqYEcgt1W3wuug1L/OPhAeAWkA1I6BwAhIWuBV0ockYymsFYoDoLYIhEUAEAClk8FVWAQAAdA6EwiKACIAaqtgSAQQAZA/Kh5NfAQQ/vVWQX4uILsKeADQWgXZCGD8KwbARAAUAL1tgLsolNwHmAkA8r4ApAe2ANT2QboTQnqgdgBUGUT5Vw2AKIOoEljovR5s5C+DsBGgeCq4osogzL/uBHjHAGwSUFbVZfWV26ZfvjGAmATU3ovtrtbP7+/q6wtBIeG3MJv4xgDC/fa8/3xo//0rYtAY+f35/vyN3mS/p/abMgJKj0z72/OnrZqBwHuHMwxAbxMSgHsMkD3A4azTubr+hNt+EoLayd1IGIAvaxMSgHsuRAbAC2DXAagqn/0WQTCBW+j7ogA03lc97zwA5xigrwMYANV2eACDwwkIgX0WOQBX70NcAQBc1wP0LMhrbdtUgWpH2m/0Qx0Q4d0HwB2VUACuMUA3QRIAGX+OAOfEBhCyBQPA1QhJ/wSAoPPvJhDkpAcgeAsGgKMIMNNA746qUP+1jcExUaEfbHnbJHgLDoDdCJkLIe+OKuLfhuqf/pDzeNUNwG/4JgwAuwgw82Dvfuj+RxxUXgB2EaD9EwC24QfVKwMJAL5wAKwiwN0N9O3nuwodlK3UJMCaCXCXwt4dhVbATsaUMHMChlWQuxkUZZOQmgQMqyB3LyDeqluPKpA5AcMqyPiHAdhLACATMKiC7BOReKuMl9wJGFRB9nZgvFOP7mUwdwKWmQB8CgBAE9CvguwTgXijjJnsCegDYG8Ixxv16dYHcieg3wY4/yEA9ufz7nxmJ4bf6QCgCViBAZy3Vadt4J2K3AnoAeDXBXC721a3G+Tl8Yf+2VU8gO31rnzEhRcPYA0EcK6M5wOrrxX5w7fTGQOg+/XjAeCfCpI721WPH+wWx1A/rQXAEgbgXJk/2f5yarBe20ACgGI0APzCAGpXpv/r6ijKnQfAntjEl4C9v+fwAN5RALZ2AMgI2AD23z+/ZOWwE9D03C11O246AK4A1PbCAHTW26fZhxMLoEvAd229aBpuST2QiAPArwzwH1yvAt4XhhBj4Abg58dYQXC8UBXunoDd7tJZ7yQC8AYCsDWfkN9XyPIAVsbKgWPzLbkAAEVV9V6mVwHA+BiksTguAEDffkHdXt56vqSgAoDxzRdjkTwBYPCs/HDhe5xuAA//xgLh4ATcPxs0eQLMiwHWfwiA3urQQABHY43N7AH0PpwQBOBgfkdz9gnovyMRAuDY/z4KGAD7ysYbFsDgDYEAAIPPqKITULGvLECL4HB5ONsFDtZHgtAAuPXK0C5g7YxLgP3pRHgCuL//gG2Dw9/OAHB9RRgOgHlzBwnAfkmMBuD6YB4+AQX94gYQgOMlOQqAPfxbjQGAImACkFwOu18SJAD0byA9zIwDwF8KUfcD3C9JEgB2bgDjJID4shUKgPslUS0JaMUDkNwUdbcaPQnwEkDdFXbjVZUANwETgOTBSDSADAlw1gHUk6FZJMD1FltviciUADIkwDkfeMkFIAtCHAR6AAQLJOaRAPu6oL9AQrBEZiYJsCas/SUygkVSc0lAMWiG+QDkSsCgDPSXyQkWSs4oAdSfopoQQLYE9MtA379gsfSMEmDeuRsulk5fLj+nBBiDYLhcnqyCZVkCAWRMgDEIhi9MeKtg+zH34wEIIGcCHhcF1suzl94L8dbH3IEAsibgPgiG/l/eVofD8Xg6nS6t6v9zNL9jDwSQNwHX6ZD92ty728gIAPIm4BoB+8XJ5WQAMieg+/S54xsSqhPgMZM0BNoZse2/LgKKE4AE0Kzkcb0+TxcBIIDcCWgi4PqAwvq/SUAdAecn9f6bBNSNwOWfHgNAAPkTUCycAMhGCASQPwHFhxMAOQaAABQkwO2fbIQ/Xnk2+G3+beeSd1bj/OlWPiPl1r8NAcA9Augx8OUVtUXlkve4nD9Nb5K0jW8EcJPBeEH+pvwI8vlnJoPxAvxJ+TG08QJgLoiipdO/fwSgx4Doj4mPKL9/7qZApGY3ArjrgVjldurRKwEAWgaV9gDfJABfBpWWAKIENgICcK0HViDaP7IMqvRfMgEARkBpCeD84yKgswRQPbATrBPqnAWQPRAbgQt/NNOLDwAuAnMNACoCKmtgSABQEVBZA4MCAIqARgBhAXjBzAU0NoFQ/5AIKAQQHABIBBR2wXD/iIvC3G5tsVcBpuT3BdSNAPo+wFDyVqgOQGALvElaB9XNgyIqYKe/BiDWv7gOKgMQVQGcTWHtlIEAAGZJREFUyequgMQV8Kr/BCDFvyyAEgIQOQUyJRgEagDwTwJQS++FagAkdcCHkgFk776X7D+9DGixHyAoAJ1SZgNKbgiJCkCnxEKoA0DyDMBUWiFUcVcY4j+RgAYAwgbwUAoATUNBlP+0VpAfgLgByAhk74NA/0kEcrYBqP8UApGrINh/woQobxUETIDEBHICgJ//RrGjIOM6wVH8RxLIVwRG8h9LIFsRGM3/FMk54T/oP+66IMtMADb/BxDIUQRQ1H+UIu4PTA9gAv8xE4LJx8AI0x+XgpvB1GPB4XAmf4sCi8GUY2Ci+N8UtA4mnQtNF/+bgl3BVF8HTFL9h4oYBhNFYOL43xVQDKewn+X0d+JDMEEnzHX6O7GVYGwAGS/4t8WMAQQR2NN/RFn/A4QnR21GxBjQ5lkG/L2ZEcBPCNXZb+RDgI6A0tpv5UYArYPKbn4Bm/UgYD2Y/2FA7gB4W8v4Xw2AD4JN1+z3ZcWAeGdkM4eTb2jAQNgJZhF9S0tzLAgAzO3cm1q/34KQ2AkW8xn3Xi07CPFlYDHnUz/QuqYQ0wtr7/M/85ZePz427F90qq3/Re+mXhsQm82iUWu5Uf0fauN/3PlTTz31lDr9A+cXH4/IW2/MAAAAAElFTkSuQmCC" style="width:100%;height:100%;object-fit:contain" />`,
  webchat: `<svg viewBox="0 0 24 24" fill="none"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M9 10h6M9 13h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
}

const platforms = [
  { key: 'whatsapp', label: 'WhatsApp', color: 'text-green-400', bg: 'bg-[#25D366]/10', border: 'border-green-500/20', note: "WhatsApp Business hesabınızı bağlayın", type: 'zernio' as const },
  { key: 'instagram', label: 'Instagram', color: 'text-pink-400', bg: 'bg-[#E4405F]/10', border: 'border-pink-500/20', note: "Instagram işletme hesabınızı bağlayın", type: 'zernio' as const },
  { key: 'facebook', label: 'Facebook Messenger', color: 'text-blue-400', bg: 'bg-[#0866FF]/10', border: 'border-blue-500/20', note: "Facebook sayfanızı bağlayın", type: 'zernio' as const },
  { key: 'telegram', label: 'Telegram', color: 'text-sky-400', bg: 'bg-[#0088CC]/10', border: 'border-sky-500/20', note: "BotFather'da oluşturduğunuz botu bağlayın", type: 'telegram' as const },
  { key: 'webchat', label: 'Web Chat', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', note: "Web sitenize entegre edin, müşterilerinizle canlı iletişim kurun", type: 'webchat' as const },
  { key: 'trendyol', label: 'Trendyol', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', note: "Trendyol mağazanıza gelen soruları cevaplayın", type: 'apikey' as const },
  { key: 'hepsiburada', label: 'Hepsiburada', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', note: "Hepsiburada mağazanıza gelen soruları cevaplayın", type: 'apikey' as const },
  { key: 'n11', label: 'n11', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', note: "n11 mağazanıza gelen soruları cevaplayın", type: 'apikey' as const },
]

const WEB_CHAT_STEPS = [
  { title: 'Kodu Kopyalayın', desc: 'Aşağıdaki kodu kopyalayın, web sitenize ekleyeceksiniz.' },
  { title: 'Web Sitenize Ekleyin', desc: 'WordPress, Wix, İkas vb. panelinizde "Özel Kod" veya "Header" bölümüne yapıştırın.' },
  { title: 'Tamam!', desc: 'Müşterileriniz web sitenizde sohbet balonu görecek. Gelen mesajlar bu panele düşecek.' },
]

export default function ChatbotIntegrationsPage() {
  const searchParams = useSearchParams()
  const [connections, setConnections] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [profileReady, setProfileReady] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [telegramModal, setTelegramModal] = useState(false)
  const [telegramToken, setTelegramToken] = useState('')
  const [telegramTesting, setTelegramTesting] = useState(false)
  const [telegramError, setTelegramError] = useState('')
  const [telegramConnected, setTelegramConnected] = useState(false)
  const [telegramBotInfo, setTelegramBotInfo] = useState<any>(null)
  const [currentTenantId, setCurrentTenantId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [apiKeyModal, setApiKeyModal] = useState<{ platform: string; label: string } | null>(null)
  const [apiKeyForm, setApiKeyForm] = useState({ apiKey: '', apiSecret: '', merchantId: '' })
  const [apiKeySaving, setApiKeySaving] = useState(false)
  const [apiKeyError, setApiKeyError] = useState('')
  const [apiKeyConnected, setApiKeyConnected] = useState<Record<string, boolean>>({})
  const [tenantSlug, setTenantSlug] = useState<string>('')
  const [webchatConnected, setWebchatConnected] = useState(false)
  const [webchatModal, setWebchatModal] = useState(false)
  const [webchatCode, setWebchatCode] = useState('')

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 5000)
  }

  const getTenantId = async (): Promise<string | null> => {
    try {
      const res = await fetch('/api/tenants/me', { credentials: 'include' })
      if (!res.ok) return null
      const json = await res.json()
      const t = json?.tenant || json
      const id = t?.id
      if (id) setCurrentTenantId(id)
      if (t?.slug) { setTenantSlug(t.slug); return t.slug }
      return id
    } catch { return null }
  }

  const fetchConnections = async () => {
    try {
      const res = await fetch('/api/zernio/connections', { credentials: 'include' })
      if (res.ok) {
        const json = await res.json()
        setConnections(json.data?.[0] || null)
      }
    } catch {}
    setLoading(false)
  }

  const checkTelegramStatus = async () => {
    const tid = await getTenantId()
    if (!tid) return
    try {
      const res = await fetch('/api/telegram/tenant-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: tid }),
      })
      const json = await res.json()
      setTelegramConnected(json.connected)
      setTelegramBotInfo(json.botInfo || null)
    } catch {}
  }

  const ensureProfile = async () => {
    const tid = await getTenantId()
    if (!tid) return
    try {
      await fetch('/api/zernio/ensure-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: tid }),
      })
      setProfileReady(true)
    } catch {}
  }

  useEffect(() => {
    const connected = searchParams.get('connected')
    const error = searchParams.get('error')
    if (connected) showToast('success', connected + ' başarıyla bağlandı!')
    if (error) showToast('error', decodeURIComponent(error))
    fetchConnections()
    ensureProfile()
    checkTelegramStatus()
  }, [searchParams])

  const handleConnect = async (platform: string, type: string) => {
    if (type === 'telegram') {
      setTelegramToken('')
      setTelegramError('')
      setTelegramModal(true)
      return
    }
    if (type === 'apikey') {
      const p = platforms.find(x => x.key === platform)
      setApiKeyForm({ apiKey: '', apiSecret: '', merchantId: '' })
      setApiKeyError('')
      setApiKeyModal({ platform, label: p?.label || platform })
      return
    }
    if (type === 'webchat') {
      let slug = tenantSlug
      if (!slug) {
        try {
          const res = await fetch('/api/tenants/me', { credentials: 'include' })
          if (res.ok) { const json = await res.json(); const t = json?.tenant || json; slug = t?.slug || 'default'; setTenantSlug(slug) }
        } catch { slug = 'default' }
      }
      setWebchatCode(`<script src="https://bruskapp.com/embed.js" data-tenant="${slug}"></script>`)
      setWebchatModal(true)
      return
    }
    setConnecting(platform)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 35000)
    try {
      const tenantId = currentTenantId || await getTenantId()
      if (!tenantId) { setConnecting(null); return }
      const connRes = await fetch('/api/zernio/connect/' + platform + '?tenantId=' + tenantId, { signal: controller.signal })
      const data = await connRes.json()
      clearTimeout(timeout)
      if (data.success && data.url) {
        const isApp = window.matchMedia('(display-mode: standalone)').matches || !!(navigator as any).standalone
        if (isApp) {
          window.open(data.url, '_blank')
          setConnecting(null)
          showToast('success', platform.charAt(0).toUpperCase() + platform.slice(1) + ' sayfası açıldı, onaylayın ve geri dönün.')
        } else {
          window.location.href = data.url
        }
      } else {
        showToast('error', 'Bağlantı URL alınamadı: ' + (data.message || ''))
        setConnecting(null)
      }
    } catch (e: any) {
      clearTimeout(timeout)
      showToast('error', 'Bağlantı hatası: ' + (e.message || ''))
      setConnecting(null)
    }
  }

  const handleApiKeySave = async () => {
    if (!apiKeyModal) return
    setApiKeySaving(true)
    setApiKeyError('')
    try {
      const res = await fetch('/api/marketplace/' + apiKeyModal.platform + '/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          apiKey: apiKeyForm.apiKey,
          apiSecret: apiKeyForm.apiSecret,
          merchantId: apiKeyForm.merchantId || undefined,
        }),
      })
      const json = await res.json()
      if (json.success) {
        setApiKeyConnected(prev => ({ ...prev, [apiKeyModal.platform]: true }))
        setApiKeyModal(null)
        showToast('success', apiKeyModal.label + ' bağlandı!')
      } else {
        setApiKeyError(json.message || 'Bağlantı başarısız')
      }
    } catch {
      setApiKeyError('Bağlantı hatası')
    } finally {
      setApiKeySaving(false)
    }
  }

  const handleApiKeyDisconnect = async (platform: string) => {
    try {
      await fetch('/api/marketplace/' + platform + '/disconnect', {
        method: 'POST',
        credentials: 'include',
      })
      setApiKeyConnected(prev => ({ ...prev, [platform]: false }))
      showToast('success', platform + ' bağlantısı kesildi')
    } catch {}
  }

  const handleTelegramConnect = async () => {
    if (!telegramToken.trim()) {
      setTelegramError('Lütfen bot token girin')
      return
    }
    setTelegramTesting(true)
    setTelegramError('')
    try {
      const tenantId = currentTenantId || await getTenantId()
      if (!tenantId) { setTelegramError('Tenant bulunamadı'); setTelegramTesting(false); return }
      const res = await fetch('/api/telegram/tenant-connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, token: telegramToken.trim() }),
      })
      const json = await res.json()
      if (json.success) {
        setTelegramConnected(true)
        setTelegramBotInfo(json.botInfo)
        setTelegramModal(false)
        showToast('success', 'Telegram botu başarıyla bağlandı!')
      } else {
        setTelegramError(json.message || 'Bağlantı başarısız')
      }
    } catch { setTelegramError('Bağlantı hatası') } finally {
      setTelegramTesting(false)
    }
  }

  const handleTelegramDisconnect = async () => {
    const tenantId = currentTenantId || await getTenantId()
    if (!tenantId) return
    try {
      await fetch('/api/telegram/tenant-disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId }),
      })
      setTelegramConnected(false)
      setTelegramBotInfo(null)
      showToast('success', 'Telegram bağlantısı kesildi')
    } catch {}
  }

  const handleDisconnect = async (platform: string, type: string) => {
    if (type === 'telegram') { await handleTelegramDisconnect(); return }
    if (type === 'apikey') { await handleApiKeyDisconnect(platform); return }
    if (type === 'webchat') { setWebchatConnected(false); showToast('success', 'Web Chat devre dışı bırakıldı'); return }
    try {
      const tenantId = currentTenantId || await getTenantId()
      if (!tenantId) return
      await fetch('/api/zernio/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, platform }),
      })
      showToast('success', platform + ' bağlantısı kesildi')
      fetchConnections()
    } catch {}
  }

  const isPlatformConnected = (key: string, type: string) => {
    if (key === 'telegram') return telegramConnected
    if (type === 'apikey') return apiKeyConnected[key] || false
    if (type === 'webchat') return webchatConnected
    return (connections?.platforms || []).some((p: any) => p.platform === key)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className={'fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border backdrop-blur-xl transition-all animate-in slide-in-from-right ' + (toast.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-300' : 'bg-red-500/10 border-red-500/20 text-red-300')}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {telegramModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setTelegramModal(false)}>
          <div className="bg-[#0d1117] border border-[#1a2332] rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#0088CC]/10">
                  <svg className="w-6 h-6 text-sky-400" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                </div>
                <h3 className="text-white font-semibold">Telegram Bot Bağla</h3>
              </div>
              <button onClick={() => setTelegramModal(false)} className="text-gray-500 hover:text-gray-300 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">@BotFather ile yeni bir bot oluşturun, aldığınız tokenı aşağıya yapıştırın.</p>
            <input type="text" value={telegramToken} onChange={e => { setTelegramToken(e.target.value); setTelegramError('') }} placeholder="1234567890:ABCdefGHIjklmNOPqrSTUvWXyz" className="w-full px-4 py-3 rounded-xl bg-[#1a2332] border border-[#2a3a4a] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors mb-4" />
            {telegramError && <p className="text-xs text-red-400 mb-3">{telegramError}</p>}
            <button onClick={handleTelegramConnect} disabled={telegramTesting} className="w-full py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-sky-600 to-sky-500 text-white hover:shadow-lg hover:shadow-sky-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {telegramTesting ? <><Loader2 className="w-4 h-4 animate-spin" /> Doğrulanıyor...</> : <><Bot className="w-4 h-4" /> Doğrula ve Bağla</>}
            </button>
          </div>
        </div>
      )}

      {webchatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => { setWebchatModal(false); if (!webchatConnected) setTenantSlug('') }}>
          <div className="bg-[#0d1117] border border-[#1a2332] rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500/10">
                  <Globe className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-white font-semibold">Web Chat Kurulumu</h3>
              </div>
              <button onClick={() => { setWebchatModal(false); if (!webchatConnected) setTenantSlug('') }} className="text-gray-500 hover:text-gray-300 transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-6">
              {WEB_CHAT_STEPS.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{i + 1}</div>
                    {i < WEB_CHAT_STEPS.length - 1 && <div className="w-0.5 flex-1 bg-[#1a2332] my-1" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <h4 className="text-white font-medium text-sm mb-1">{step.title}</h4>
                    <p className="text-xs text-gray-500">{step.desc}</p>
                  </div>
                </div>
              ))}

              <div className="bg-[#080b12] border border-[#1a2332] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-gray-500 font-medium">Embed Kodu</label>
                  <button onClick={() => copyToClipboard(webchatCode)} className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                    {copied ? <><Check size={12} className="text-green-400" /> Kopyalandı</> : <><Copy size={12} /> Kopyala</>}
                  </button>
                </div>
                <code className="block text-xs text-gray-300 font-mono bg-[#0d1117] rounded-lg p-3 border border-[#1a2332] break-all">{webchatCode || 'Yükleniyor...'}</code>
              </div>

              <div className="flex gap-3">
                <button onClick={() => { setWebchatModal(false) }} className="flex-1 py-2.5 border border-[#1a2332] text-gray-400 rounded-xl text-sm font-medium hover:text-white transition-all">
                  İptal
                </button>
                <button onClick={() => { setWebchatConnected(true); setWebchatModal(false); showToast('success', 'Web Chat aktifleştirildi! Kodu web sitenize ekleyin.') }} className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2">
                  <Check size={16} /> Aktifleştir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {apiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setApiKeyModal(null)}>
          <div className="bg-[#0d1117] border border-[#1a2332] rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/10">
                  <Key className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-white font-semibold">{apiKeyModal.label} API Bağla</h3>
              </div>
              <button onClick={() => setApiKeyModal(null)} className="text-gray-500 hover:text-gray-300 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">{apiKeyModal.label} satıcı panelinizden API anahtarlarınızı alıp girin. Gelen müşteri soruları otomatik cevaplanacak.</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1.5">API Key / App Key</label>
                <input type="text" value={apiKeyForm.apiKey} onChange={e => setApiKeyForm({ ...apiKeyForm, apiKey: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-[#1a2332] border border-[#2a3a4a] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1.5">API Secret / App Secret</label>
                <input type="password" value={apiKeyForm.apiSecret} onChange={e => setApiKeyForm({ ...apiKeyForm, apiSecret: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-[#1a2332] border border-[#2a3a4a] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1.5">Merchant ID (varsa)</label>
                <input type="text" value={apiKeyForm.merchantId} onChange={e => setApiKeyForm({ ...apiKeyForm, merchantId: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-[#1a2332] border border-[#2a3a4a] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors" />
              </div>
            </div>
            {apiKeyError && <p className="text-xs text-red-400 mt-3">{apiKeyError}</p>}
            <button onClick={handleApiKeySave} disabled={apiKeySaving || !apiKeyForm.apiKey || !apiKeyForm.apiSecret} className="w-full mt-4 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {apiKeySaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Doğrulanıyor...</> : <><Link2 className="w-4 h-4" /> Bağla</>}
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Chatbot Entegrasyonları</h1>
          <p className="text-sm text-gray-500 mt-1">Tüm platformları bağlayın, gelen sorular otomatik cevap alsın</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {platforms.map((p) => {
          const isConnected = isPlatformConnected(p.key, p.type)
          return (
            <div key={p.key} className={'bg-[#0d1117]/80 backdrop-blur-xl border rounded-2xl p-6 transition-all ' + (isConnected ? 'border-green-500/20' : 'border-[#1a2332] hover:border-blue-500/30')}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={'w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden ' + p.bg}>
                    <div className={'w-7 h-7 ' + p.color} dangerouslySetInnerHTML={{ __html: PLATFORM_SVGS[p.key] }} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{p.label}</h3>
                    <p className="text-xs text-gray-500">
                      {isConnected
                        ? (p.key === 'telegram' && telegramBotInfo ? '@' + (telegramBotInfo.username || '') : 'Bağlı')
                        : p.note}
                    </p>
                  </div>
                </div>
                {isConnected ? <CheckCircle className="w-5 h-5 text-green-400" /> : <XCircle className="w-5 h-5 text-gray-600" />}
              </div>
              {isConnected ? (
                <button onClick={() => handleDisconnect(p.key, p.type)} className="w-full py-2.5 rounded-xl text-sm font-medium border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all">
                  Bağlantıyı Kes
                </button>
              ) : (
                <button onClick={() => handleConnect(p.key, p.type)} disabled={connecting === p.key} className="w-full py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {connecting === p.key ? <><Loader2 className="w-4 h-4 animate-spin" /> Bağlanıyor...</> : <><Link2 className="w-4 h-4" /> Hesap Bağla</>}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
