<script>
	import Mainpage from "./mainpage.svelte";
	import Productpage from "./productpage.svelte";
	import Child from "./Child.svelte";
	import Login from "./login.svelte";
	import Bind from "./bind.svelte";

	let age01 = 20;
	let age02 = 21;
	
	const allData01 = {
		user: '김철수',
		age: age01,
		hobby: '축구하기'
	}
	const allData02 = {
		user: '김영희',
		age: age02,
		hobby: '넷플릭스보기'
	}

</script> 

<Bind />
<Login />
<Child { ...allData01 } />
<Child { ...allData02 } />
<Mainpage />
<hr />
<Productpage />