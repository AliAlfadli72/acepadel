<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Link, usePage } from '@inertiajs/vue3'

const mobileOpen = ref(false)
const scrolled = ref(false)

const page = usePage()

const links = [
  { path: '/', label: { ar: 'الرئيسية', en: 'Home' } },
  { path: '/services', label: { ar: 'الخدمات', en: 'Services' } },
  { path: '/booking', label: { ar: 'الحجز', en: 'Booking' } },
  { path: '/events', label: { ar: 'الفعاليات', en: 'Events' } },
  { path: '/blog', label: { ar: 'المدونة', en: 'Blog' } },
  { path: '/contact', label: { ar: 'تواصل', en: 'Contact' } },
]

// temporary language (we’ll connect later)
const lang = ref('en')

const handleScroll = () => {
  scrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <header
    :class="[
      'sticky top-0 z-50 transition-all',
      scrolled
        ? 'bg-white/90 backdrop-blur shadow border-b'
        : 'bg-white border-b'
    ]"
  >
    <div class="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">

      <!-- LOGO -->
      <Link href="/" class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
          <span class="text-accent font-bold">A</span>
        </div>
        <span class="font-bold text-primary">ACE PADEL</span>
      </Link>

      <!-- DESKTOP NAV -->
      <nav class="hidden lg:flex gap-6">
        <Link
          v-for="link in links"
          :key="link.path"
          :href="link.path"
          class="text-sm font-semibold text-gray-600 hover:text-primary"
          :class="{ 'text-primary': $page.url === link.path }"
        >
          {{ lang === 'ar' ? link.label.ar : link.label.en }}
        </Link>
      </nav>

      <!-- ACTIONS -->
      <div class="flex items-center gap-3">

        <!-- Language -->
        <button
          @click="lang = lang === 'ar' ? 'en' : 'ar'"
          class="w-9 h-9 border rounded-full text-xs"
        >
          {{ lang === 'ar' ? 'EN' : 'AR' }}
        </button>

        <!-- CTA -->
        <Link href="/booking" class="hidden sm:block btn-accent px-4 py-2">
          {{ lang === 'ar' ? 'احجز الآن' : 'Book Now' }}
        </Link>

        <!-- Mobile -->
        <button
          @click="mobileOpen = !mobileOpen"
          class="lg:hidden"
        >
          ☰
        </button>
      </div>
    </div>

    <!-- MOBILE MENU -->
    <div v-if="mobileOpen" class="lg:hidden bg-white border-t">
      <div class="p-4 flex flex-col gap-3">
        <Link
          v-for="link in links"
          :key="link.path"
          :href="link.path"
          class="py-2"
        >
          {{ lang === 'ar' ? link.label.ar : link.label.en }}
        </Link>
      </div>
    </div>
  </header>
</template>