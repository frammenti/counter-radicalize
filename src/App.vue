<script setup lang='ts'>
import Header from './components/Header.vue'
import Hero from './components/Hero.vue'
import About from './components/About.vue'
import Transcript from './components/Transcript.vue'
import LinguisticFeatures from './components/LinguisticFeatures.vue'
import Footer from './components/Footer.vue'

document.cookie = '_fontshare_key=value; SameSite=None; Secure; path=/';
</script>

<template>
  <Header />
  <main>
    <div class='landing'>
      <Hero />
    </div>
    <About />
    <Transcript />
    <LinguisticFeatures />
  </main>
  <Footer />
</template>

<style scoped lang='scss'>
$schemes: (light, dark);

$breakpoints: (
  mobile: 0,
  tablet: 768px,
  desktop: 1280px
);

$resolutions: (
  1x: '',
  2x: '@2x'
);

@mixin set-background($selector) {
  @each $scheme in $schemes {
    @each $break, $min-width in $breakpoints {
      @each $res, $suffix in $resolutions {
        $file: 'bg-#{$break}-#{$scheme}#{$suffix}.webp';

        // Base query: preferred color scheme
        $queries: '(prefers-color-scheme: #{$scheme})';

        // Append breakpoint if not on mobile
        @if $min-width != 0 {
          $queries: '#{$queries} and (min-width: #{$min-width})';
        }

        // Append resolution for retina screens
        @if $res == 2x {
          $queries: '#{$queries} and (min-resolution: 2dppx)';
        }

        @media #{$queries} {
          #{$selector} {
            background-image: url('./assets/images/#{$file}');
          }
        }
      }
    }
  }
}

.landing {
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 50% 100%;
}

@include set-background('.landing');
</style>
