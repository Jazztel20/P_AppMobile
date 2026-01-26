<!-- FOOTER -->
<script></script>

<template>
  <footer>
    <div class="footer-column">
      <div class="footer-title">Suivez-nous</div>
      <div class="social-icons">
        <div class="social-icon"><a href="https://fr.linkedin.com/"><img src="../../assets/images/linkedin.svg" alt="linkedin-logo"></a></div>
        <div class="social-icon"><a href="https://www.facebook.com/"><img src="../../assets/images/facebook-logo.svg" alt="facebook-logo"></a></div>
        <div class="social-icon"><a href="https://www.instagram.com/"><img src="../../assets/images/instagram.svg" alt="instagram-logo"></a></div>
      </div>
    </div>

    <div class="footer-center">© Vibe</div>

    <div class="footer-column">
      <div class="footer-title"><a href="#">Contact</a></div>
      <div>
        <a href="mailto:vincent.panzeta@eduvaud.ch">vincent.panzeta@eduvaud.ch</a>
      </div>
      <div>+41.7x.xxx.xx.xx</div>
    </div>
  </footer>
</template>

<style scoped="">
footer {
  width: 100%;
  background: #8ad6ff;
  border-top: 2px solid #0172c5;
  padding: 20px 0px;
  display: flex;
  justify-content: space-evenly;
  align-items: flex-start;
  font-size: 12px;
}

 
.footer-column {
  min-width: 150px;
}
 
.footer-title {
  font-weight: 600;
  margin-bottom: 6px;
}
 
.social-icons {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}
 
.social-icon a img{
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
}
 
.footer-center {
  text-align: center;
  align-self: center;
  font-size: 16px;
}
 
a {
  color: inherit;
  text-decoration: none;
}
</style>
