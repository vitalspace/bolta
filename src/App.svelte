<script>
  import { Router, Link, Route } from "svelte5-router"
  import Home from "./routes/Home.svelte"
  import Play from "./routes/Play.svelte"
</script>

<Router>
<!-- Menu -->
  <div>
    <Route path="/" component={Home} />
    <Route path="/play" component={Play} />

  </div>
</Router>