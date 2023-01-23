<script>
  let user = { loggedIn: false };

  function toggle() {
    user.loggedIn = !user.loggedIn;
  }

  let weekdays = ['일','월','화','수','목','금','토'];
  let teams = ['SSG 랜더스','LG 트윈스','키움 히어로즈','KT 위즈','KIA 타이거즈','NC 다이노스','삼성 라이온즈','롯데 자이언츠','두산 베어스','한화 이글스'];
</script>

{#if user.loggedIn}
  <button on:click={toggle}>
    로그아웃
  </button>
  <p>현재 로그인상태입니다.</p>
{:else}
  <button on:click={toggle}>
    로그인
  </button>
  <p>현재 로그아웃상태입니다.</p>
{/if}

<select>
  {#each weekdays as weekday}
    <option>{weekday}요일</option>
  {/each}
</select>

<h3>2022 KBO 정규리그순워</h3>
{#each teams as team, i}
  <p>{i + 1}위 : {team}</p>
{/each}