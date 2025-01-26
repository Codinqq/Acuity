<template>
  <div class="cards flex bg-gradient-to-br">
    <div class="flex flex-col lg:flex-row rounded-3xl bg-palette-dark-gray">
      <div class="featureCards">
        <div class="featureTitle">Automod</div>
        <div class="featureContent">
          The AutoMod module prevents people from spamming, swearing,
          advertising and using to much caps. You may simply enable the modules
          using the dashboard at
          <code class="codeBlocks">/dashboard</code>
        </div>
      </div>
      <div class="featureCards">
        <div class="featureTitle">Reaction Roles</div>
        <div class="featureContent">
          Reaction roles are one of the modules in Acuity, where you can create
          reactions that give users roles. You can simply create a reaction role
          by using
          <code class="codeBlocks">/reactionroles</code>
        </div>
      </div>
      <div class="featureCards">
        <div class="featureTitle">Applications</div>
        <div class="featureContent">
          Acuity has one of the most advanced applications out right now. You
          can have more than one application, and you can easily create
          applications. You can create applications using
          <code class="codeBlocks">/applications</code>
          and make people use
          <code class="codeBlocks">/apply</code>
          if they want to apply
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {}
</script>

<style lang="postcss" scoped>
.codeBlocks {
  @apply bg-gray-700 rounded px-1 font-light;
}

.cards {
  @apply my-10 from-palette-purple to-palette-pink mx-5 rounded-3xl shadow-2xl p-1;
}

.featureTitle {
  @apply transition duration-500 ease-in-out xl:text-2xl md:text-2xl text-white font-light flex-auto pb-3 text-xl m-2 mx-auto pt-5 font-autobahn tracking-widest;
}

.featureContent {
  @apply transition duration-500 ease-in-out xl:text-xl md:text-lg text-white font-light flex-auto sm:text-sm m-2 xl:mx-5;
}

.featureCards {
  @apply transition duration-500 ease-in-out flex flex-grow flex-col h-1/2 mx-5 xl:m-1 xl:w-1/3 xl:px-5 xl:h-64 bg-white bg-opacity-0 rounded-3xl py-3 hover:bg-opacity-5 hover:shadow-2xl my-5;
}
</style>
