<template>
  <div id="app">
    <!-- Page Wrapper -->
    <div id="wrapper">

      <!-- Sidebar -->
      <ul class="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">

        <!-- Sidebar - Brand -->
        <router-link class="sidebar-brand d-flex align-items-center justify-content-center" to="/">
          <div class="sidebar-brand-icon rotate-n-15">
            <i class="fas fa-camera-retro"></i>
          </div>
          <div class="sidebar-brand-text mx-3">Photo Memory</div>
        </router-link>

        <!-- Divider -->
        <hr class="sidebar-divider">

        <!-- Heading -->
        <div class="sidebar-heading">
          Memories
        </div>

        <!-- Nav Item - Dashboard -->
        <li class="nav-item ">
          <router-link class="nav-link" to="/">
            <i class="fas fa-fw fa-plus"></i>
            <span>Create Memory</span>
          </router-link>
        </li>

<!--        <hr class="sidebar-divider my-0">-->

        <li class="nav-item">
          <router-link class="nav-link" to="/memories">
            <i class="fas fa-fw fa-folder"></i>
            <span>Memories</span>
          </router-link>
        </li>


        <!-- Divider -->
        <hr class="sidebar-divider">

        <!-- Heading -->
        <div class="sidebar-heading">
          Settings
        </div>

        <li class="nav-item">
          <router-link class="nav-link" to="/settings">
            <i class="fas fa-fw fa-wrench"></i>
            <span>Settings</span>
          </router-link>
        </li>

        <!-- Nav Item - Pages Collapse Menu -->
<!--        <li class="nav-item active">-->
<!--          <a class="nav-link" href="#" data-toggle="collapse" data-target="#collapseTwo" aria-expanded="true" aria-controls="collapseTwo">-->
<!--            <i class="fas fa-fw fa-cog"></i>-->
<!--            <span>Components</span>-->
<!--          </a>-->
<!--          <div id="collapseTwo" class="collapse show" aria-labelledby="headingTwo" data-parent="#accordionSidebar">-->
<!--            <div class="bg-white py-2 collapse-inner rounded">-->
<!--              <h6 class="collapse-header">Custom Components:</h6>-->
<!--              <a class="collapse-item" href="buttons.html">Buttons</a>-->
<!--              <a class="collapse-item active" href="cards.html">Cards</a>-->
<!--            </div>-->
<!--          </div>-->
<!--        </li>-->

        <!--&lt;!&ndash; Nav Item - Utilities Collapse Menu &ndash;&gt;-->
        <!--<li class="nav-item">-->
          <!--<a class="nav-link collapsed" href="#" data-toggle="collapse" data-target="#collapseUtilities" aria-expanded="true" aria-controls="collapseUtilities">-->
            <!--<i class="fas fa-fw fa-wrench"></i>-->
            <!--<span>Utilities</span>-->
          <!--</a>-->
          <!--<div id="collapseUtilities" class="collapse" aria-labelledby="headingUtilities" data-parent="#accordionSidebar">-->
            <!--<div class="bg-white py-2 collapse-inner rounded">-->
              <!--<h6 class="collapse-header">Custom Utilities:</h6>-->
              <!--<a class="collapse-item" href="utilities-color.html">Colors</a>-->
              <!--<a class="collapse-item" href="utilities-border.html">Borders</a>-->
              <!--<a class="collapse-item" href="utilities-animation.html">Animations</a>-->
              <!--<a class="collapse-item" href="utilities-other.html">Other</a>-->
            <!--</div>-->
          <!--</div>-->
        <!--</li>-->

        <!--&lt;!&ndash; Divider &ndash;&gt;-->
        <!--<hr class="sidebar-divider">-->

        <!--&lt;!&ndash; Heading &ndash;&gt;-->
        <!--<div class="sidebar-heading">-->
          <!--Addons-->
        <!--</div>-->

        <!--&lt;!&ndash; Nav Item - Pages Collapse Menu &ndash;&gt;-->
        <!--<li class="nav-item">-->
          <!--<a class="nav-link collapsed" href="#" data-toggle="collapse" data-target="#collapsePages" aria-expanded="true" aria-controls="collapsePages">-->
            <!--<i class="fas fa-fw fa-folder"></i>-->
            <!--<span>Pages</span>-->
          <!--</a>-->
          <!--<div id="collapsePages" class="collapse" aria-labelledby="headingPages" data-parent="#accordionSidebar">-->
            <!--<div class="bg-white py-2 collapse-inner rounded">-->
              <!--<h6 class="collapse-header">Login Screens:</h6>-->
              <!--<a class="collapse-item" href="login.html">Login</a>-->
              <!--<a class="collapse-item" href="register.html">Register</a>-->
              <!--<a class="collapse-item" href="forgot-password.html">Forgot Password</a>-->
              <!--<div class="collapse-divider"></div>-->
              <!--<h6 class="collapse-header">Other Pages:</h6>-->
              <!--<a class="collapse-item" href="404.html">404 Page</a>-->
              <!--<a class="collapse-item" href="blank.html">Blank Page</a>-->
            <!--</div>-->
          <!--</div>-->
        <!--</li>-->

        <!--&lt;!&ndash; Nav Item - Charts &ndash;&gt;-->
        <!--<li class="nav-item">-->
          <!--<a class="nav-link" href="charts.html">-->
            <!--<i class="fas fa-fw fa-chart-area"></i>-->
            <!--<span>Charts</span></a>-->
        <!--</li>-->

        <!--&lt;!&ndash; Nav Item - Tables &ndash;&gt;-->
        <!--<li class="nav-item">-->
          <!--<a class="nav-link" href="tables.html">-->
            <!--<i class="fas fa-fw fa-table"></i>-->
            <!--<span>Tables</span></a>-->
        <!--</li>-->

        <!--&lt;!&ndash; Divider &ndash;&gt;-->
        <!--<hr class="sidebar-divider d-none d-md-block">-->

        <!--&lt;!&ndash; Sidebar Toggler (Sidebar) &ndash;&gt;-->
        <!--<div class="text-center d-none d-md-inline">-->
          <!--<button class="rounded-circle border-0" id="sidebarToggle"></button>-->
        <!--</div>-->

      </ul>
      <!-- End of Sidebar -->

      <!-- Content Wrapper -->
      <div id="content-wrapper" class="d-flex flex-column">

        <router-view></router-view>

      </div>
      <!-- End of Content Wrapper -->

      <text-editor v-show="showEditor"></text-editor>
    </div>
    <!-- End of Page Wrapper -->
  </div>
</template>

<script>
  import TextEditor from './components/TextEditor'
  import { mapGetters } from 'vuex'

  export default {
    name: 'photo-memory',
    components: {
      TextEditor
    },
    computed: {
      ...mapGetters(['showEditor'])
    }
  }
</script>

<style lang="scss">
  @import 'assets/scss/application';
</style>
