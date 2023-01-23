<script>
  let count = 1;

  $: if(count >= 10){
    alert('10개 이상 구매할 수 없음');
    count = 9;
  }
  $: if(count < 1){
    alert('1개 이상 구매해야 함');
    count = 1;
  }

  function plusHandle() {
    count++;
  }
  function minusHandle() {
    count--;
  }

  let x = null;

  function numChange(e){
    x = e.target.value;
  }
</script>

<label for="testBox">양수 / 음수 테스트</label>
<input type="text" id="testBox" on:keyup={numChange} placeholder="정수를 입력하세요.">

{#if x > 0}
  <p>작성한 숫자는 양수입니다.</p>
{:else if x < 0}
  <p>작성한 숫자는 음수입니다.</p>
{:else if x === '0'} <!-- ?왜 문자열임? -->
  <p>작성한 숫자는 0입니다.</p>
{:else}
  <p>정수로 다시 입력하세요.</p>
{/if}

<button on:click={minusHandle}>-</button>
<input type="text" value="{count}" style="width: 25px;">
<button on:click={plusHandle}>+</button>