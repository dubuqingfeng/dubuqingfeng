"use strict";(self.webpackChunkmy_website=self.webpackChunkmy_website||[]).push([[2033],{3905:(t,e,n)=>{n.d(e,{Zo:()=>u,kt:()=>d});var o=n(7294);function i(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function r(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(t);e&&(o=o.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,o)}return n}function a(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{};e%2?r(Object(n),!0).forEach((function(e){i(t,e,n[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(n,e))}))}return t}function s(t,e){if(null==t)return{};var n,o,i=function(t,e){if(null==t)return{};var n,o,i={},r=Object.keys(t);for(o=0;o<r.length;o++)n=r[o],e.indexOf(n)>=0||(i[n]=t[n]);return i}(t,e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);for(o=0;o<r.length;o++)n=r[o],e.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(t,n)&&(i[n]=t[n])}return i}var c=o.createContext({}),l=function(t){var e=o.useContext(c),n=e;return t&&(n="function"==typeof t?t(e):a(a({},e),t)),n},u=function(t){var e=l(t.components);return o.createElement(c.Provider,{value:e},t.children)},g={inlineCode:"code",wrapper:function(t){var e=t.children;return o.createElement(o.Fragment,{},e)}},p=o.forwardRef((function(t,e){var n=t.components,i=t.mdxType,r=t.originalType,c=t.parentName,u=s(t,["components","mdxType","originalType","parentName"]),p=l(n),d=i,m=p["".concat(c,".").concat(d)]||p[d]||g[d]||r;return n?o.createElement(m,a(a({ref:e},u),{},{components:n})):o.createElement(m,a({ref:e},u))}));function d(t,e){var n=arguments,i=e&&e.mdxType;if("string"==typeof t||i){var r=n.length,a=new Array(r);a[0]=p;var s={};for(var c in e)hasOwnProperty.call(e,c)&&(s[c]=e[c]);s.originalType=t,s.mdxType="string"==typeof t?t:i,a[1]=s;for(var l=2;l<r;l++)a[l]=n[l];return o.createElement.apply(null,a)}return o.createElement.apply(null,n)}p.displayName="MDXCreateElement"},581:(t,e,n)=>{n.r(e),n.d(e,{assets:()=>c,contentTitle:()=>a,default:()=>g,frontMatter:()=>r,metadata:()=>s,toc:()=>l});var o=n(7462),i=(n(7294),n(3905));const r={},a=void 0,s={unversionedId:"Wiki/programming/golang/goroutine/goroutine",id:"Wiki/programming/golang/goroutine/goroutine",title:"goroutine",description:"Goroutine",source:"@site/docs/Wiki/programming/golang/goroutine/goroutine.md",sourceDirName:"Wiki/programming/golang/goroutine",slug:"/Wiki/programming/golang/goroutine/",permalink:"/docs/Wiki/programming/golang/goroutine/",draft:!1,editUrl:"https://github.com/dubuqingfeng/dubuqingfeng/tree/master/wiki/docs/Wiki/programming/golang/goroutine/goroutine.md",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"gc",permalink:"/docs/Wiki/programming/golang/gc/"},next:{title:"gm",permalink:"/docs/Wiki/programming/golang/goroutine/gm"}},c={},l=[{value:"Goroutine",id:"goroutine",level:3},{value:"G",id:"g",level:4},{value:"\u8c03\u5ea6\u7b56\u7565",id:"\u8c03\u5ea6\u7b56\u7565",level:4}],u={toc:l};function g(t){let{components:e,...n}=t;return(0,i.kt)("wrapper",(0,o.Z)({},u,n,{components:e,mdxType:"MDXLayout"}),(0,i.kt)("h3",{id:"goroutine"},"Goroutine"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"https://github.com/golang/go/blob/master/src/runtime/runtime2.go"},"https://github.com/golang/go/blob/master/src/runtime/runtime2.go")),(0,i.kt)("h4",{id:"g"},"G"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre"},"// G \u7ed3\u6784\u4f53\ntype g struct {\n    // Stack parameters.\n    // stack describes the actual stack memory: [stack.lo, stack.hi).\n    // stackguard0 is the stack pointer compared in the Go stack growth prologue.\n    // It is stack.lo+StackGuard normally, but can be StackPreempt to trigger a preemption.\n    // stackguard1 is the stack pointer compared in the C stack growth prologue.\n    // It is stack.lo+StackGuard on g0 and gsignal stacks.\n    // It is ~0 on other goroutine stacks, to trigger a call to morestackc (and crash).\n    stack       stack   // offset known to runtime/cgo\n    stackguard0 uintptr // offset known to liblink\n    stackguard1 uintptr // offset known to liblink\n\n    _panic    *_panic // innermost panic - offset known to liblink\n    _defer    *_defer // innermost defer\n    m         *m      // current m; offset known to arm liblink\n    sched     gobuf\n    syscallsp uintptr // if status==Gsyscall, syscallsp = sched.sp to use during gc\n    syscallpc uintptr // if status==Gsyscall, syscallpc = sched.pc to use during gc\n    stktopsp  uintptr // expected sp at top of stack, to check in traceback\n    // param is a generic pointer parameter field used to pass\n    // values in particular contexts where other storage for the\n    // parameter would be difficult to find. It is currently used\n    // in three ways:\n    // 1. When a channel operation wakes up a blocked goroutine, it sets param to\n    //    point to the sudog of the completed blocking operation.\n    // 2. By gcAssistAlloc1 to signal back to its caller that the goroutine completed\n    //    the GC cycle. It is unsafe to do so in any other way, because the goroutine's\n    //    stack may have moved in the meantime.\n    // 3. By debugCallWrap to pass parameters to a new goroutine because allocating a\n    //    closure in the runtime is forbidden.\n    param        unsafe.Pointer\n    atomicstatus uint32\n    stackLock    uint32 // sigprof/scang lock; TODO: fold in to atomicstatus\n    goid         int64\n    schedlink    guintptr\n    waitsince    int64      // approx time when the g become blocked\n    waitreason   waitReason // if status==Gwaiting\n\n    preempt       bool // preemption signal, duplicates stackguard0 = stackpreempt\n    preemptStop   bool // transition to _Gpreempted on preemption; otherwise, just deschedule\n    preemptShrink bool // shrink stack at synchronous safe point\n\n    // asyncSafePoint is set if g is stopped at an asynchronous\n    // safe point. This means there are frames on the stack\n    // without precise pointer information.\n    asyncSafePoint bool\n\n    paniconfault bool // panic (instead of crash) on unexpected fault address\n    gcscandone   bool // g has scanned stack; protected by _Gscan bit in status\n    throwsplit   bool // must not split stack\n    // activeStackChans indicates that there are unlocked channels\n    // pointing into this goroutine's stack. If true, stack\n    // copying needs to acquire channel locks to protect these\n    // areas of the stack.\n    activeStackChans bool\n    // parkingOnChan indicates that the goroutine is about to\n    // park on a chansend or chanrecv. Used to signal an unsafe point\n    // for stack shrinking. It's a boolean value, but is updated atomically.\n    parkingOnChan uint8\n\n    raceignore     int8     // ignore race detection events\n    sysblocktraced bool     // StartTrace has emitted EvGoInSyscall about this goroutine\n    tracking       bool     // whether we're tracking this G for sched latency statistics\n    trackingSeq    uint8    // used to decide whether to track this G\n    runnableStamp  int64    // timestamp of when the G last became runnable, only used when tracking\n    runnableTime   int64    // the amount of time spent runnable, cleared when running, only used when tracking\n    sysexitticks   int64    // cputicks when syscall has returned (for tracing)\n    traceseq       uint64   // trace event sequencer\n    tracelastp     puintptr // last P emitted an event for this goroutine\n    lockedm        muintptr\n    sig            uint32\n    writebuf       []byte\n    sigcode0       uintptr\n    sigcode1       uintptr\n    sigpc          uintptr\n    gopc           uintptr         // pc of go statement that created this goroutine\n    ancestors      *[]ancestorInfo // ancestor information goroutine(s) that created this goroutine (only used if debug.tracebackancestors)\n    startpc        uintptr         // pc of goroutine function\n    racectx        uintptr\n    waiting        *sudog         // sudog structures this g is waiting on (that have a valid elem ptr); in lock order\n    cgoCtxt        []uintptr      // cgo traceback context\n    labels         unsafe.Pointer // profiler labels\n    timer          *timer         // cached timer for time.Sleep\n    selectDone     uint32         // are we participating in a select and did someone win the race?\n\n    // goroutineProfiled indicates the status of this goroutine's stack for the\n    // current in-progress goroutine profile\n    goroutineProfiled goroutineProfileStateHolder\n\n    // Per-G GC state\n\n    // gcAssistBytes is this G's GC assist credit in terms of\n    // bytes allocated. If this is positive, then the G has credit\n    // to allocate gcAssistBytes bytes without assisting. If this\n    // is negative, then the G must correct this by performing\n    // scan work. We track this in bytes to make it fast to update\n    // and check for debt in the malloc hot path. The assist ratio\n    // determines how this corresponds to scan work debt.\n    gcAssistBytes int64\n}\n")),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre"},'// Machine\ntype m struct {\n    g0      *g     // goroutine with scheduling stack\n    morebuf gobuf  // gobuf arg to morestack\n    divmod  uint32 // div/mod denominator for arm - known to liblink\n    _       uint32 // align next field to 8 bytes\n\n    // Fields not known to debuggers.\n    procid        uint64            // for debuggers, but offset not hard-coded\n    gsignal       *g                // signal-handling g\n    goSigStack    gsignalStack      // Go-allocated signal handling stack\n    sigmask       sigset            // storage for saved signal mask\n    tls           [tlsSlots]uintptr // thread-local storage (for x86 extern register)\n    mstartfn      func()\n    curg          *g       // current running goroutine\n    caughtsig     guintptr // goroutine running during fatal signal\n    p             puintptr // attached p for executing go code (nil if not executing go code)\n    nextp         puintptr\n    oldp          puintptr // the p that was attached before executing a syscall\n    id            int64\n    mallocing     int32\n    throwing      throwType\n    preemptoff    string // if != "", keep curg running on this m\n    locks         int32\n    dying         int32\n    profilehz     int32\n    spinning      bool // m is out of work and is actively looking for work\n    blocked       bool // m is blocked on a note\n    newSigstack   bool // minit on C thread called sigaltstack\n    printlock     int8\n    incgo         bool   // m is executing a cgo call\n    freeWait      uint32 // if == 0, safe to free g0 and delete m (atomic)\n    fastrand      uint64\n    needextram    bool\n    traceback     uint8\n    ncgocall      uint64      // number of cgo calls in total\n    ncgo          int32       // number of cgo calls currently in progress\n    cgoCallersUse uint32      // if non-zero, cgoCallers in use temporarily\n    cgoCallers    *cgoCallers // cgo traceback if crashing in cgo call\n    park          note\n    alllink       *m // on allm\n    schedlink     muintptr\n    lockedg       guintptr\n    createstack   [32]uintptr // stack that created this thread.\n    lockedExt     uint32      // tracking for external LockOSThread\n    lockedInt     uint32      // tracking for internal lockOSThread\n    nextwaitm     muintptr    // next m waiting for lock\n    waitunlockf   func(*g, unsafe.Pointer) bool\n    waitlock      unsafe.Pointer\n    waittraceev   byte\n    waittraceskip int\n    startingtrace bool\n    syscalltick   uint32\n    freelink      *m // on sched.freem\n\n    // these are here because they are too large to be on the stack\n    // of low-level NOSPLIT functions.\n    libcall   libcall\n    libcallpc uintptr // for cpu profiler\n    libcallsp uintptr\n    libcallg  guintptr\n    syscall   libcall // stores syscall parameters on windows\n\n    vdsoSP uintptr // SP for traceback while in VDSO call (0 if not in call)\n    vdsoPC uintptr // PC for traceback while in VDSO call\n\n    // preemptGen counts the number of completed preemption\n    // signals. This is used to detect when a preemption is\n    // requested, but fails. Accessed atomically.\n    preemptGen uint32\n\n    // Whether this is a pending preemption signal on this M.\n    // Accessed atomically.\n    signalPending uint32\n\n    dlogPerM\n\n    mOS\n\n    // Up to 10 locks held by this m, maintained by the lock ranking code.\n    locksHeldLen int\n    locksHeld    [10]heldLockInfo\n}\n')),(0,i.kt)("p",null,"work-strealing"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-golang"},"runtime.schedule() {\n    // only 1/61 of the time, check the global runnable queue for a G.\n    // if not found, check the local queue.\n    // if not found,\n    //     try to steal from other Ps.\n    //     if not, check the global runnable queue.\n    //     if not found, poll network.\n}\n")),(0,i.kt)("h4",{id:"\u8c03\u5ea6\u7b56\u7565"},"\u8c03\u5ea6\u7b56\u7565"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"https://github.com/lifei6671/interview-go/blob/master/base/go-scheduler.md"},"https://github.com/lifei6671/interview-go/blob/master/base/go-scheduler.md")))}g.isMDXComponent=!0}}]);