<template>
  <div
    class="min-h-screen flex flex-col bg-gray-700 bg-cover min-w-screen select-none"
  >
    <Navbar class="mb-5"/>
    <div
      class="text-center text-white m-5 p-1 rounded-3xl bg-gradient-to-tr from-palette-purple to-palette-pink"
    >
      <div class="rounded-3xl bg-palette-dark-gray p-5">
        <h1 class="text-2xl my-5 font-autobahn tracking-widest">Terms And Conditions</h1>

        <p>Last updated: October 20, 2022</p>
        <p>
          Please read these Terms and Conditions ("Terms", "Terms and
          Conditions") carefully before using the Acuity Discord Bot (the
          "Service") operated by Codinq ("us", "we", or "our").
        </p>
        <p>
          Your access to and use of the Service is conditioned on your
          acceptance of and compliance with these Terms. These Terms apply to
          all visitors, users and others who access or use the Service.
        </p>
        <p>
          By accessing or using the Service you agree to be bound by these
          Terms. If you disagree with any part of the terms then you may not
          access the Service.
        </p>

        <h2 class="text-xl my-3">Links To Other Web Sites</h2>
        <p>
          Our Service may contain links to third-party web sites or services
          that are not owned or controlled by Acuity.
        </p>
        <p>
          Acuity has no control over, and assumes no responsibility for, the
          content, privacy policies, or practices of any third party web sites
          or services. You further acknowledge and agree that Acuity shall not
          be responsible or liable, directly or indirectly, for any damage or
          loss caused or alleged to be caused by or in connection with use of or
          reliance on any such content, goods or services available on or
          through any such web sites or services.
        </p>
        <p>
          We strongly advise you to read the terms and conditions and privacy
          policies of any third-party web sites or services that you visit.
        </p>

        <h2 class="text-xl my-3">Information we collect</h2>
        <p>
          We collect information such as the guilds settings and the users
          profiles.
        </p>
        <p>
          We collect these data, so the guild-owners can change the settings of
          Acuity, we store the users profiles, so they can customize it, and so
          we can check which theme you have.
        </p>
        <p>
          We might get more information about the guild, but only if we suspect
          that you're breaking these tos.
        </p>
        <p>
          We won't do anything with these data, such as selling them, or using
          them to other purposes than the ones stated above.
        </p>

        <h2 class="text-xl my-3">Termination of access</h2>
        <p>
          We may terminate access to Acuity, if you use Acuity when breaking
          international law, breaking the bot or by not using Acuity to its
          intented purpose.
        </p>

        <h2 class="text-xl my-3">Governing Law</h2>
        <p>
          These Terms shall be governed and construed in accordance with the
          laws of Norway, without regard to its conflict of law provisions.
        </p>
        <p>
          Our failure to enforce any right or provision of these Terms will not
          be considered a waiver of those rights. If any provision of these
          Terms is held to be invalid or unenforceable by a court, the remaining
          provisions of these Terms will remain in effect. These Terms
          constitute the entire agreement between us regarding our Service, and
          supersede and replace any prior agreements we might have between us
          regarding the Service.
        </p>

        <h2 class="text-xl my-3">Changes</h2>
        <p>
          We reserve the right, at our sole discretion, to modify or replace
          these Terms at any time. If a revision is material we will try to
          provide at least 15 days notice prior to any new terms taking effect.
          What constitutes a material change will be determined at our sole
          discretion.
        </p>
        <p>
          By continuing to access or use our Service after those revisions
          become effective, you agree to be bound by the revised terms. If you
          do not agree to the new terms, please stop using the Service.
        </p>

        <h2 class="text-xl my-3">Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us at
          <code class="bg-black px-1 py-1 rounded-lg">acuity@codinq.xyz</code>.
        </p>
      </div>
    </div>

    <Footer class="mt-5" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      title: "Acuity - Terms of Service",
    };
  },
  head() {
    return {
      title: this.title,
      meta: [
        {
          hid: "og:title",
          name: "og:title",
          content: "Acuity - Terms of Service",
        },
        {
          hid: "og:image",
          name: "og:image",
          content:
            "https://cdn.glitch.com/bc3529d6-efb9-4e88-9e31-2ee07ae97af2%2Fimage.ico?v=1628599605942",
        },
        {
          hid: "og:description",
          name: "og:description",
          content:
            "The TOS of Acuity, which you should read before using Acuity.",
        },
        {
          hid: "og:url",
          name: "og:url",
          content: "https://acuity.codinq.xyz/tos",
        },
      ],
    };
  },
};
</script>