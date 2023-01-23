<script>
  let name = '';

  let a = 1;
  let b = 2;

  let chk = false;

  let choiceSize = 0;
  let sizes = ['Tall', 'Grande', 'Venti'];

  let portals = [
		{ name: '사이트선택', url: null },
		{ name: '네이버', url: 'https://naver.com' },
		{ name: '다음', url: 'https://daum.net' },
		{ name: '구글', url: 'https://google.com' }
	];
	let selected;

  function selectChange(){
    if(selected != null){
      window.open(selected);
    }
  }
</script>

<h3>포털 사이트 바로가기</h3>
<select bind:value={selected} on:change={selectChange}>
  {#each portals as portal}
    <option value={portal.url}>{ portal.name }</option>    
  {/each}
</select>

<h3>사이즈 선택</h3>
{#each sizes as size, i}
  <label>
    <input type="radio" bind:group={choiceSize} value={i}>
    {size}
  </label>
{/each}
<p>고객님은 {sizes[choiceSize]}를 선택하셨습니다.</p>

<input type="text" bind:value={name} placeholder="이름을 입력하세요.">
<p>안녕! {name || '낯선 사람'}!</p>

<label>
  <input type=number bind:value={a} min=0 max=10>
  <input type=range bind:value={a} min=0 max=10>
</label>

<label>
  <input type=number bind:value={b} min=0 max=10>
  <input type=range bind:value={b} min=0 max=10>
</label>

<p>{a} X {b} = {a * b}</p>

<label>
  <input type="checkbox" bind:checked={chk}>
  약관 동의
</label>

{#if chk}
  <p>당신은 약관에 동의했습니다.<br>이제 구독이 가능합니다.</p>
{:else}
  <p>당신은 약관에 동의하지 않았습니다.<br>아직 구독이 불가능합니다.</p>
{/if}

<button disabled={!chk}>구독</button>