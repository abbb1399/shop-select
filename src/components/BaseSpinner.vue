<template>
  <div class="wrapper">
    <div class="spinner"></div>
  </div>
</template>

<style lang="scss" scoped>
.wrapper {
  height: 20rem;
  display: flex;
  justify-content: center;
  align-items: center;

  .spinner {
    height: 7rem;
    width: 7rem;
    border: 6px solid;
    border-color: black transparent black transparent;
    border-radius: 50%;
    animation: spin 1.3s ease infinite;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
