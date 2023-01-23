<script>
	let btss = [
		{
			id: 1,
			name: 'RM(김남준)',
			birth: 1994,
			img: 'https://search.pstatic.net/sunny/?src=https%3A%2F%2Fw.namu.la%2Fs%2Fbbd9629ef96c284dfca79eb3b26d49e49ba24b78117abba76b3108cd2b5b8b2860f4d7ceeaef314116b608d5b9d7b080d7e7751e385cc03988992088f8b932b5280a1d1075b1c5bd4759e679166564ca9a95b4ca0bdbdaa219462eacbcbd37be&type=fff264_180'
		},
		{
			id: 2,
			name: '진(김석진)',
			birth: 1992,
			img: 'https://search.pstatic.net/sunny/?src=https%3A%2F%2Fw.namu.la%2Fs%2F8152fad7a07738b7d11b8fe1b44b3cd0db34d5fa5c35abee4deae2fd163a4218f003e753532e1edd20a4db12e88382c0f3342d054cba5a0d38ba8bd9be593138ae4b6404caf7373e92540f2688467b825caa89de860dccc282395d440f6f72db&type=fff264_180'
		},
		{
			id: 3,
			name: '슈가(민윤기)',
			birth: 1993,
			img: 'https://search.pstatic.net/sunny/?src=https%3A%2F%2Fw.namu.la%2Fs%2Ff4f55ac286d2de6ead4dcf4ab419ca0ba3c44e3badcffe171f727d2653d9dce70d3a2a016307c21a9345fe53c74f099657bc5c96006acc61dc32eecff8e197818ed47d31fbfffc2e17654634345a357017536656b0258d7d1b26ee6b687095b4&type=fff264_180'
		},
		{
			id: 4,
			name: '제이홉(정호석)',
			birth: 1994,
			img: 'https://search.pstatic.net/sunny/?src=https%3A%2F%2Fw.namu.la%2Fs%2F67b1d265064ef6fce5ff59b3cf9195e64afade8493633cbf57087c55d40655c08a9481278bf960455ab4ea434bc3c250d57333d6c48743124de4c20d359684728713f1d0b8b063bc510feece8729186146cdbdba6cba15864bc4582aeebce6d5&type=fff264_180'
		},
		{
			id: 5,
			name: '지민(박지민)',
			birth: 1995,
			img: 'https://search.pstatic.net/sunny/?src=https%3A%2F%2Fw.namu.la%2Fs%2F379e369eeb01b0fff2ee569d236747e80764442246f1e00bdbc34f658e04847956c3e323a151ebd6f9306aa2214d3f4b5a7ee7142629a1fc727c0ece80642b8d1774fd7f36f2e7fb997cbc7c8f9e135c80e06dd63905e3d4b0de5b1a4a6e143d&type=fff264_180'
		},
		{
			id: 6,
			name: '뷔(김태형)',
			birth: 1995,
			img: 'https://search.pstatic.net/sunny/?src=https%3A%2F%2Fw.namu.la%2Fs%2F6e0bcfbe998a033312f0bf704f9880b48048bd960bacafe27ddc7080a9f3149e15ff59e4182c0436b95eed13012fc28c6d0219557cec1f7f9beb2438d64f36072cf50e4e513bb5ed4f3d62aba528f3b06d3edc89d5011d62961f04dc6d60fdf8&type=fff264_180'
		},
		{
			id: 7,
			name: '정국(진정국)',
			birth: 1995,
			img: 'https://search.pstatic.net/sunny/?src=https%3A%2F%2Fw.namu.la%2Fs%2F7619aa7dee9b330bef6e184fdb6f8ae4bdaa49915f6cb516266b5b8a7e814e65b39931cb4baad7cffcd61927d0da0e2fa1950e3776e84a339b8c8d3ff943cc25697f4ec55a52b07869b7a2fe04fbe508b4145fc8b26dcb5d437d34e734ebefed&type=fff264_180'
		},
	];

  function deleteMember(){
    btss = btss.slice(1);
  }
</script>

<button on:click={deleteMember}>멤버삭제</button>

{#each btss as bts}
<h3><img src="{bts.img}" alt=""></h3>
<h3>이름 : { bts.name }</h3>
<h3>출생 : { bts.birth }</h3>
<hr>
{/each}