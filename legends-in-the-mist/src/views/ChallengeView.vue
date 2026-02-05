<template>
  <div class="view view--challenge">
    <button type="button" :class="`mode mode--${challenge.mode}`" @click="challenge.mode = (challenge.mode === 'edit' ? 'view' : 'edit')">
      <SvgIcon icon="Edit" />
    </button>
    <div class="challenge challenge--edit" v-if="challenge.mode === 'edit'">
      <div class="challenge__header">
        <div class="challenge__title">
          <div class="challenge__name"><input type="text" v-model="meta.name" placeholder="Challenge Name"></div>
          <div class="challenge__rating"><input type="number" v-model="challenge.meta.rating" placeholder="Rating"></div>
        </div>
        <div class="challenge__roles">
          <input type="text" v-model="challenge.meta.roles" placeholder="Roles (comma separated)"/>
        </div>
        <div class="challenge__description">
          <textarea v-model="challenge.meta.description" placeholder="Description"></textarea>
        </div>
      </div>
      <div class="challenge__left-col">
        <div class="challenge__limits">
          <span class="title title--dashed-center">Limits</span>
          <div class="list">
              <div class="limit deleteable" v-for="limit in challenge.limits" :key="limit._id">
                <div class="limit__meta">
                  <input type="text" v-model="limit.name" placeholder="Name">
                  <input type="number" v-model="limit.value" placeholder="Value">
                  <button type="button" @click="challenge.deleteLimit(limit._id)" class="action-button action-button--delete"><SvgIcon icon="Delete" /></button>
                </div>
                <textarea v-model="limit.description" placeholder="Description"></textarea>
              </div>
              <div class="newlimit">
                <div class="limit__meta">
                  <input type="text" v-model="newLimit.name" placeholder="New Limit">
                  <input type="number" v-model="newLimit.value" placeholder="Value">
                  <button @click="addLimit" class="action-button action-button--add"><SvgIcon icon="Add" /></button>
                </div>
              </div>
          </div>
        </div>
        <div class="challenge__tags-and-statuses">
          <span class="title title--dashed-center">Tags & Statuses</span>
          <div class="list">
              <div class="tag-or-status deleteable" v-for="tagOrStatus in challenge.tagsAndStatuses" :key="tagOrStatus._id">
                <input type="text" v-model="tagOrStatus.name">
                <input type="text" v-model="tagOrStatus.value">
                <button type="button" @click="challenge.deleteTagOrStatus(tagOrStatus._id)" class="action-button action-button--delete"><SvgIcon icon="Delete" /></button>
              </div>
              <div class="newtag-or-status">
                <input type="text" v-model="newTagOrStatus.name">
                <input type="number" v-model="newTagOrStatus.value">
                <button @click="addTagOrStatus" class="action-button action-button--add"><SvgIcon icon="Add" /></button>
              </div>
          </div>
        </div>
        <div class="challenge__mighties">
          <span class="title title--dashed-center">Mighties</span>
          <div class="list">
              <div class="mighty deleteable" v-for="mighty in challenge.mighties" :key="mighty._id">
                <div class="mighty__type">
                  <div :class="`display display--${mighty.type.toLowerCase()}`">
                    <SvgIcon :icon="mighty.type" />
                    <span>▼</span>
                  </div>
                  <select v-model="mighty.type">
                    <option value="Origin">Origin</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Greatness">Greatness</option>
                  </select>
                </div>
                <input type="text" v-model="mighty.description" placeholder="Description">
                <button type="button" @click="challenge.deleteMighty(mighty._id)" class="action-button action-button--delete"><SvgIcon icon="Delete" /></button>
              </div>
              <div class="newmighty">
                <div class="mighty__type">
                  <div :class="`display display--${newMighty.type.toLowerCase()}`">
                    <SvgIcon :icon="newMighty.type" />
                    <span>▼</span>
                  </div>
                  <select v-model="newMighty.type">
                    <option value="Origin">Origin</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Greatness">Greatness</option>
                  </select>
                </div>
                <input type="text" v-model="newMighty.description" placeholder="New Mighty">
                <button @click="addMighty" class="action-button action-button--add"><SvgIcon icon="Add" /></button>
              </div>
          </div>
        </div>
        <div class="challenge__special-features">
          <span class="title title--dashed-center">Special Features</span>
          <div class="list">
              <div class="feature deleteable" v-for="feature in challenge.specialFeatures" :key="feature._id">
                <div class="actionable-row">
                  <input type="text" v-model="feature.name" placeholder="Name">
                  <button type="button" @click="challenge.deleteSpecialFeature(feature._id)" class="action-button action-button--delete"><SvgIcon icon="Delete" /></button>
                </div>
                <textarea v-model="feature.description" placeholder="Progress Special Feature"></textarea>
              </div>
              <div class="newfeature">
                <div class="actionable-row">
                  <input type="text" v-model="newSpecialFeature.name" placeholder="New Feature">
                  <button @click="addSpecialFeature" class="action-button action-button--add"><SvgIcon icon="Add" /></button>
                </div>
              </div>
          </div>
        </div>
      </div>
      <div class="challenge__divider"></div>
      <div class="challenge__right-col">
          <div class="challenge__threats">
            <span class="title title--dashed-left">Threats & Consequences</span>
            <div class="list">
                <div class="threat deleteable" v-for="threat in challenge.threats" :key="threat._id">
                  <div class="threat__meta">
                    <div class="actionable-row">
                      <input class="threat__name" type="text" v-model="threat.name">
                      <button class="threat__delete action-button action-button--delete" type="button" @click="challenge.deleteThreat(threat._id)"><SvgIcon icon="Delete" /></button>
                    </div>
                    <textarea class="threat__description" v-model="threat.description"></textarea>
                  </div>
                  <div class="threat__consequences">
                      <div class="list">
                        <div class="consequence deleteable" v-for="consequence in threat.consequences" :key="consequence._id">
                            <svg class="consequence__icon" viewBox="0 0 34 35" xmlns="http://www.w3.org/2000/svg">
                              <g>
                                  <path d="M15.498,31.847L14.282,31.071L13.19,29.595L12.3,28.833L11.248,27.915L10.198,26.893L9.182,25.943L8.172,24.859L7.178,24.047L6.2,22.581L5.292,22.111L4.188,20.683L3.264,20.035L2.166,18.941L1.394,17.485L1.146,16.983L1.446,16.511L2.134,15.419L2.994,14.209L4.398,13.145L5.226,12.249L6.33,11.251L7.376,10.305L8.31,9.339L9.266,8.323L10.026,7.267L11.494,6.231L11.986,5.313L13.456,4.223L14.194,3.329L15.264,2.287L16.574,1.495L17.122,1.181L17.64,1.539L18.68,2.255L19.862,3.065L21,4.187L22.006,5.097L23.024,6.211L24.004,7.075L24.978,8.431L25.854,9.323L26.85,10.227L27.884,11.245L28.922,12.005L29.992,13.293L30.914,14.229L31.934,15.005L32.154,15.175L32.254,15.431L32.744,16.679L32.914,17.117L32.688,17.529L32.068,18.645L31.086,19.893L29.832,20.937L28.934,21.867L28.034,22.889L26.974,23.929L25.758,24.873L24.962,25.803L24.13,26.875L22.692,27.889L21.892,28.767L20.812,29.769L20.044,30.773L18.804,31.831L17.564,32.549L17.038,32.847L16.528,32.517C16.186,32.293 15.842,32.071 15.498,31.847Z" style="fill:white;fill-rule:nonzero;"/>
                                  <path d="M31.934,16.005L32.551,14.219L32.76,14.38L32.154,16.175L33.088,14.818L33.183,15.061L32.254,16.431L31.607,15.987L31.595,15.983L32.254,16.431L33.185,15.066L33.675,16.314L32.744,17.679L32.586,17.571L32.587,17.573L32.744,17.679L33.681,16.33L33.842,16.745L32.914,18.117L33.784,17.61L33.57,18.001L32.688,18.529L32.129,17.574L32.123,17.569L32.688,18.529L33.562,18.015L32.903,19.201L31.807,20.594L30.513,21.671L29.669,22.545L28.76,23.577L27.633,24.683L26.451,25.601L25.737,26.435L24.828,27.606L23.357,28.643L22.603,29.472L21.554,30.444L20.774,31.465L19.384,32.651L18.061,33.417L17.003,34.016L15.982,33.355L15.98,33.354C15.64,33.131 15.298,32.91 14.956,32.688L13.588,31.815L12.453,30.281L11.646,29.59L10.57,28.651L9.507,27.617L8.474,26.65L7.486,25.591L6.429,24.727L5.511,23.351L4.636,22.898L3.489,21.415L2.619,20.804L1.353,19.543L0.504,17.941L0,16.922L0.601,15.976L1.303,14.862L2.268,13.505L3.723,12.401L4.522,11.537L5.659,10.509L6.68,9.586L7.586,8.649L8.492,7.686L9.312,6.547L10.724,5.55L11.21,4.643L12.762,3.492L13.457,2.651L14.648,1.491L16.066,0.633L17.172,0L18.208,0.716L19.246,1.431L20.5,2.291L21.687,3.46L22.712,4.387L23.726,5.497L24.75,6.4L25.745,7.785L26.547,8.602L27.537,9.5L28.533,10.481L29.612,11.271L30.734,12.622L31.576,13.476L32.539,14.209L31.934,16.005ZM31.82,17.056L31.83,17.063L31.823,17.051L31.813,17.044L31.323,15.797L30.308,15.025L30.251,14.982L29.25,13.965L28.231,12.739L27.234,12.009L26.163,10.954L25.16,10.044L24.21,9.077L23.258,7.75L22.322,6.926L21.3,5.807L20.313,4.914L19.223,3.84L18.114,3.079L17.072,2.362L15.879,3.084L14.93,4.008L14.149,4.954L12.761,5.983L12.264,6.912L10.739,7.987L10.039,8.961L9.033,10.029L8.071,11.024L7,11.993L5.93,12.961L5.072,13.889L3.72,14.913L2.965,15.976L2.292,17.044L2.979,18.339L3.909,19.266L4.886,19.951L5.948,21.325L6.889,21.812L7.926,23.367L8.857,24.128L9.89,25.236L10.888,26.17L11.926,27.18L12.954,28.077L13.926,28.909L14.976,30.328L16.04,31.007L16.043,31.009C16.387,31.233 16.731,31.455 17.073,31.678L18.224,31.011L19.314,30.081L20.069,29.094L21.181,28.063L22.026,27.135L23.431,26.144L24.186,25.171L25.064,24.146L26.315,23.175L27.307,22.201L28.198,21.189L29.15,20.203L30.365,19.192L31.232,18.09L31.813,17.044L31.82,17.056Z" style="fill:rgb(196,193,205);"/>
                                  <path d="M24.593,15.851L24.067,14.893L23.895,13.699L23.667,12.521L22.563,11.285L21.505,9.991L21.279,9.787L19.519,9.029L18.331,8.963L17.061,8.911L15.799,9.107L14.527,8.991L12.653,10.003L11.527,11.249L10.435,12.517L10.309,13.719L10.117,14.955L9.395,15.975L8.855,16.757L9.005,18.315L9.375,19.831L9.811,20.455L10.851,21.153L11.889,21.879L12.439,22.991L12.901,24.625L14.383,25.333L14.643,23.865L15.597,24.137L15.971,25.277L16.365,26.515L16.969,26.455L17.151,26.429L17.675,26.457L18.143,25.275L18.399,24.397L19.361,24.159L19.723,25.357L21.107,24.653L21.593,22.969L22.245,21.889L23.239,21.111L24.309,20.453L24.779,19.845L25.027,18.299L25.223,16.761L24.593,15.851ZM14.523,19.803L12.549,18.807L11.817,17.333L12.331,15.975L14.807,16.425L15.941,18.497L14.523,19.803ZM17.323,22.071L17.061,22.229L16.799,22.071L16.227,20.499L17.061,19.081L17.893,20.499L17.323,22.071ZM21.573,18.807L21.183,19.003C21.183,19.003 20.955,19.115 20.813,19.189C20.667,19.267 20.357,19.419 20.357,19.419L19.597,19.803L18.179,18.497L19.313,16.425L21.789,15.975L22.303,17.333L21.573,18.807Z" style="fill:rgb(58,49,89);fill-rule:nonzero;"/>
                              </g>
                            </svg>
                            <input type="text" v-model="consequence.description" placeholder="Description">
                            <button type="button" @click="challenge.deleteConsequence(threat._id, consequence._id)" class="action-button action-button--delete"><SvgIcon icon="Delete" /></button>
                        </div>
                        <div class="newconsequence">
                            <svg class="consequence__icon" viewBox="0 0 34 35" xmlns="http://www.w3.org/2000/svg">
                              <g>
                                  <path d="M15.498,31.847L14.282,31.071L13.19,29.595L12.3,28.833L11.248,27.915L10.198,26.893L9.182,25.943L8.172,24.859L7.178,24.047L6.2,22.581L5.292,22.111L4.188,20.683L3.264,20.035L2.166,18.941L1.394,17.485L1.146,16.983L1.446,16.511L2.134,15.419L2.994,14.209L4.398,13.145L5.226,12.249L6.33,11.251L7.376,10.305L8.31,9.339L9.266,8.323L10.026,7.267L11.494,6.231L11.986,5.313L13.456,4.223L14.194,3.329L15.264,2.287L16.574,1.495L17.122,1.181L17.64,1.539L18.68,2.255L19.862,3.065L21,4.187L22.006,5.097L23.024,6.211L24.004,7.075L24.978,8.431L25.854,9.323L26.85,10.227L27.884,11.245L28.922,12.005L29.992,13.293L30.914,14.229L31.934,15.005L32.154,15.175L32.254,15.431L32.744,16.679L32.914,17.117L32.688,17.529L32.068,18.645L31.086,19.893L29.832,20.937L28.934,21.867L28.034,22.889L26.974,23.929L25.758,24.873L24.962,25.803L24.13,26.875L22.692,27.889L21.892,28.767L20.812,29.769L20.044,30.773L18.804,31.831L17.564,32.549L17.038,32.847L16.528,32.517C16.186,32.293 15.842,32.071 15.498,31.847Z" style="fill:white;fill-rule:nonzero;"/>
                                  <path d="M31.934,16.005L32.551,14.219L32.76,14.38L32.154,16.175L33.088,14.818L33.183,15.061L32.254,16.431L31.607,15.987L31.595,15.983L32.254,16.431L33.185,15.066L33.675,16.314L32.744,17.679L32.586,17.571L32.587,17.573L32.744,17.679L33.681,16.33L33.842,16.745L32.914,18.117L33.784,17.61L33.57,18.001L32.688,18.529L32.129,17.574L32.123,17.569L32.688,18.529L33.562,18.015L32.903,19.201L31.807,20.594L30.513,21.671L29.669,22.545L28.76,23.577L27.633,24.683L26.451,25.601L25.737,26.435L24.828,27.606L23.357,28.643L22.603,29.472L21.554,30.444L20.774,31.465L19.384,32.651L18.061,33.417L17.003,34.016L15.982,33.355L15.98,33.354C15.64,33.131 15.298,32.91 14.956,32.688L13.588,31.815L12.453,30.281L11.646,29.59L10.57,28.651L9.507,27.617L8.474,26.65L7.486,25.591L6.429,24.727L5.511,23.351L4.636,22.898L3.489,21.415L2.619,20.804L1.353,19.543L0.504,17.941L0,16.922L0.601,15.976L1.303,14.862L2.268,13.505L3.723,12.401L4.522,11.537L5.659,10.509L6.68,9.586L7.586,8.649L8.492,7.686L9.312,6.547L10.724,5.55L11.21,4.643L12.762,3.492L13.457,2.651L14.648,1.491L16.066,0.633L17.172,0L18.208,0.716L19.246,1.431L20.5,2.291L21.687,3.46L22.712,4.387L23.726,5.497L24.75,6.4L25.745,7.785L26.547,8.602L27.537,9.5L28.533,10.481L29.612,11.271L30.734,12.622L31.576,13.476L32.539,14.209L31.934,16.005ZM31.82,17.056L31.83,17.063L31.823,17.051L31.813,17.044L31.323,15.797L30.308,15.025L30.251,14.982L29.25,13.965L28.231,12.739L27.234,12.009L26.163,10.954L25.16,10.044L24.21,9.077L23.258,7.75L22.322,6.926L21.3,5.807L20.313,4.914L19.223,3.84L18.114,3.079L17.072,2.362L15.879,3.084L14.93,4.008L14.149,4.954L12.761,5.983L12.264,6.912L10.739,7.987L10.039,8.961L9.033,10.029L8.071,11.024L7,11.993L5.93,12.961L5.072,13.889L3.72,14.913L2.965,15.976L2.292,17.044L2.979,18.339L3.909,19.266L4.886,19.951L5.948,21.325L6.889,21.812L7.926,23.367L8.857,24.128L9.89,25.236L10.888,26.17L11.926,27.18L12.954,28.077L13.926,28.909L14.976,30.328L16.04,31.007L16.043,31.009C16.387,31.233 16.731,31.455 17.073,31.678L18.224,31.011L19.314,30.081L20.069,29.094L21.181,28.063L22.026,27.135L23.431,26.144L24.186,25.171L25.064,24.146L26.315,23.175L27.307,22.201L28.198,21.189L29.15,20.203L30.365,19.192L31.232,18.09L31.813,17.044L31.82,17.056Z" style="fill:rgb(196,193,205);"/>
                                  <path d="M24.593,15.851L24.067,14.893L23.895,13.699L23.667,12.521L22.563,11.285L21.505,9.991L21.279,9.787L19.519,9.029L18.331,8.963L17.061,8.911L15.799,9.107L14.527,8.991L12.653,10.003L11.527,11.249L10.435,12.517L10.309,13.719L10.117,14.955L9.395,15.975L8.855,16.757L9.005,18.315L9.375,19.831L9.811,20.455L10.851,21.153L11.889,21.879L12.439,22.991L12.901,24.625L14.383,25.333L14.643,23.865L15.597,24.137L15.971,25.277L16.365,26.515L16.969,26.455L17.151,26.429L17.675,26.457L18.143,25.275L18.399,24.397L19.361,24.159L19.723,25.357L21.107,24.653L21.593,22.969L22.245,21.889L23.239,21.111L24.309,20.453L24.779,19.845L25.027,18.299L25.223,16.761L24.593,15.851ZM14.523,19.803L12.549,18.807L11.817,17.333L12.331,15.975L14.807,16.425L15.941,18.497L14.523,19.803ZM17.323,22.071L17.061,22.229L16.799,22.071L16.227,20.499L17.061,19.081L17.893,20.499L17.323,22.071ZM21.573,18.807L21.183,19.003C21.183,19.003 20.955,19.115 20.813,19.189C20.667,19.267 20.357,19.419 20.357,19.419L19.597,19.803L18.179,18.497L19.313,16.425L21.789,15.975L22.303,17.333L21.573,18.807Z" style="fill:rgb(58,49,89);fill-rule:nonzero;"/>
                              </g>
                            </svg>
                            <input type="text" v-model="newConsequence" placeholder="New Consequence">
                            <button type="button" @click="addConsequence(threat)" class="action-button action-button--add"><SvgIcon icon="Add" /></button>
                        </div>
                      </div>
                  </div>
                </div>
                <div class="newthreat actionable-row">
                  <input class="newthreat__name" type="text" v-model="newThreat" placeholder="New Threat">
                  <button type="button" @click="addThreat" class="action-button action-button--add"><SvgIcon icon="Add" /></button>
                </div>
            </div>
          </div>
      </div>
    </div>
    <div class="challenge challenge--view" v-else>
      <div class="challenge__header">
        <div class="challenge__title">
          <h1 class="challenge__name">{{ meta.name }}</h1>
          <div class="challenge__rating">
            <SvgIcon icon="Rating" class="challenge__rating-icon" v-for="n in challenge.meta.rating" :key="n"/>
          </div>
        </div>
        <div class="challenge__roles">
          {{ challenge.meta.roles }}
        </div>
        <div class="challenge__description">
          {{ challenge.meta.description }}
        </div>     
      </div>
      <div class="challenge__left-col">
        <div class="challenge__limits">
          <span class="title title--dashed-center">Limits</span>
          <div class="list">
            <div class="limit" v-for="limit in challenge.limits" :key="limit._id">
              <div class="limit__meta">
                <span class="limit__name">{{ limit.name }}</span>
                <div class="limit__shield">
                  <SvgIcon icon="Shield" class="limit__arrow"/>
                  <span class="limit__value" v-if="!limit.value">-</span>
                  <span class="limit__value" v-else>{{ limit.value }}</span>
                </div>
              </div>
              <SvgIcon icon="Arrow" v-if="limit.description" />
              <span v-if="limit.description" class="limit__description">{{ limit.description }}</span>
            </div>
          </div>
        </div>
        <div class="challenge__tags-and-statuses">
          <span class="title title--dashed-center">Tags & Statuses</span>
          <!-- <div class="tags">{{ challenge.tagsAndStatuses.map(t => `${t.name}${t.value ? `-${t.value}` : ''}`).join(', ') }}</div> -->
          <div class="list">
            <div class="tag-or-status" v-for="tagOrStatus in challenge.tagsAndStatuses" :key="tagOrStatus._id">
              <span>{{ tagOrStatus.name }}</span>
              <span class="tag-or-status__value" v-if="tagOrStatus.value">-{{ tagOrStatus.value }}</span>
            </div>
            <div class="mighty" v-for="mighty in challenge.mighties" :key="mighty._id">
              <div :class="`display display--${mighty.type.toLowerCase()}`">
                <SvgIcon :icon="mighty.type" />
              </div>
              <span class="mighty__description">{{ mighty.description }}</span>
            </div>
          </div>
        </div>
        <div class="challenge__special-features">
          <span class="title title--dashed-center">Special Features</span>
          <div class="list">
            <div class="feature" v-for="feature in challenge.specialFeatures" :key="feature._id">
              <span class="feature__name">{{ feature.name }}.</span>
              <span class="feature__description" v-if="feature.description">{{ feature.description }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="challenge__divider"></div>
      <div class="challenge__right-col">
        <div class="challenge__threats">
          <span class="title title--dashed-left">Threats & Consequences</span>
          <div class="list">
            <div class="threat" v-for="threat in challenge.threats" :key="threat._id">
              <div class="threat__meta">
                <span class="threat__name">{{ threat.name }}</span>
                <span class="threat__description">{{ threat.description }}</span>
              </div>
              <div class="threat__consequences">
                <div class="list">
                  <div class="consequence" v-for="consequence in threat.consequences" :key="consequence._id">
                    <svg class="consequence__icon" viewBox="0 0 34 35" xmlns="http://www.w3.org/2000/svg">
                      <g>
                        <path d="M15.498,31.847L14.282,31.071L13.19,29.595L12.3,28.833L11.248,27.915L10.198,26.893L9.182,25.943L8.172,24.859L7.178,24.047L6.2,22.581L5.292,22.111L4.188,20.683L3.264,20.035L2.166,18.941L1.394,17.485L1.146,16.983L1.446,16.511L2.134,15.419L2.994,14.209L4.398,13.145L5.226,12.249L6.33,11.251L7.376,10.305L8.31,9.339L9.266,8.323L10.026,7.267L11.494,6.231L11.986,5.313L13.456,4.223L14.194,3.329L15.264,2.287L16.574,1.495L17.122,1.181L17.64,1.539L18.68,2.255L19.862,3.065L21,4.187L22.006,5.097L23.024,6.211L24.004,7.075L24.978,8.431L25.854,9.323L26.85,10.227L27.884,11.245L28.922,12.005L29.992,13.293L30.914,14.229L31.934,15.005L32.154,15.175L32.254,15.431L32.744,16.679L32.914,17.117L32.688,17.529L32.068,18.645L31.086,19.893L29.832,20.937L28.934,21.867L28.034,22.889L26.974,23.929L25.758,24.873L24.962,25.803L24.13,26.875L22.692,27.889L21.892,28.767L20.812,29.769L20.044,30.773L18.804,31.831L17.564,32.549L17.038,32.847L16.528,32.517C16.186,32.293 15.842,32.071 15.498,31.847Z" style="fill:white;fill-rule:nonzero;"/>
                        <path d="M31.934,16.005L32.551,14.219L32.76,14.38L32.154,16.175L33.088,14.818L33.183,15.061L32.254,16.431L31.607,15.987L31.595,15.983L32.254,16.431L33.185,15.066L33.675,16.314L32.744,17.679L32.586,17.571L32.587,17.573L32.744,17.679L33.681,16.33L33.842,16.745L32.914,18.117L33.784,17.61L33.57,18.001L32.688,18.529L32.129,17.574L32.123,17.569L32.688,18.529L33.562,18.015L32.903,19.201L31.807,20.594L30.513,21.671L29.669,22.545L28.76,23.577L27.633,24.683L26.451,25.601L25.737,26.435L24.828,27.606L23.357,28.643L22.603,29.472L21.554,30.444L20.774,31.465L19.384,32.651L18.061,33.417L17.003,34.016L15.982,33.355L15.98,33.354C15.64,33.131 15.298,32.91 14.956,32.688L13.588,31.815L12.453,30.281L11.646,29.59L10.57,28.651L9.507,27.617L8.474,26.65L7.486,25.591L6.429,24.727L5.511,23.351L4.636,22.898L3.489,21.415L2.619,20.804L1.353,19.543L0.504,17.941L0,16.922L0.601,15.976L1.303,14.862L2.268,13.505L3.723,12.401L4.522,11.537L5.659,10.509L6.68,9.586L7.586,8.649L8.492,7.686L9.312,6.547L10.724,5.55L11.21,4.643L12.762,3.492L13.457,2.651L14.648,1.491L16.066,0.633L17.172,0L18.208,0.716L19.246,1.431L20.5,2.291L21.687,3.46L22.712,4.387L23.726,5.497L24.75,6.4L25.745,7.785L26.547,8.602L27.537,9.5L28.533,10.481L29.612,11.271L30.734,12.622L31.576,13.476L32.539,14.209L31.934,16.005ZM31.82,17.056L31.83,17.063L31.823,17.051L31.813,17.044L31.323,15.797L30.308,15.025L30.251,14.982L29.25,13.965L28.231,12.739L27.234,12.009L26.163,10.954L25.16,10.044L24.21,9.077L23.258,7.75L22.322,6.926L21.3,5.807L20.313,4.914L19.223,3.84L18.114,3.079L17.072,2.362L15.879,3.084L14.93,4.008L14.149,4.954L12.761,5.983L12.264,6.912L10.739,7.987L10.039,8.961L9.033,10.029L8.071,11.024L7,11.993L5.93,12.961L5.072,13.889L3.72,14.913L2.965,15.976L2.292,17.044L2.979,18.339L3.909,19.266L4.886,19.951L5.948,21.325L6.889,21.812L7.926,23.367L8.857,24.128L9.89,25.236L10.888,26.17L11.926,27.18L12.954,28.077L13.926,28.909L14.976,30.328L16.04,31.007L16.043,31.009C16.387,31.233 16.731,31.455 17.073,31.678L18.224,31.011L19.314,30.081L20.069,29.094L21.181,28.063L22.026,27.135L23.431,26.144L24.186,25.171L25.064,24.146L26.315,23.175L27.307,22.201L28.198,21.189L29.15,20.203L30.365,19.192L31.232,18.09L31.813,17.044L31.82,17.056Z" style="fill:rgb(196,193,205);"/>
                        <path d="M24.593,15.851L24.067,14.893L23.895,13.699L23.667,12.521L22.563,11.285L21.505,9.991L21.279,9.787L19.519,9.029L18.331,8.963L17.061,8.911L15.799,9.107L14.527,8.991L12.653,10.003L11.527,11.249L10.435,12.517L10.309,13.719L10.117,14.955L9.395,15.975L8.855,16.757L9.005,18.315L9.375,19.831L9.811,20.455L10.851,21.153L11.889,21.879L12.439,22.991L12.901,24.625L14.383,25.333L14.643,23.865L15.597,24.137L15.971,25.277L16.365,26.515L16.969,26.455L17.151,26.429L17.675,26.457L18.143,25.275L18.399,24.397L19.361,24.159L19.723,25.357L21.107,24.653L21.593,22.969L22.245,21.889L23.239,21.111L24.309,20.453L24.779,19.845L25.027,18.299L25.223,16.761L24.593,15.851ZM14.523,19.803L12.549,18.807L11.817,17.333L12.331,15.975L14.807,16.425L15.941,18.497L14.523,19.803ZM17.323,22.071L17.061,22.229L16.799,22.071L16.227,20.499L17.061,19.081L17.893,20.499L17.323,22.071ZM21.573,18.807L21.183,19.003C21.183,19.003 20.955,19.115 20.813,19.189C20.667,19.267 20.357,19.419 20.357,19.419L19.597,19.803L18.179,18.497L19.313,16.425L21.789,15.975L22.303,17.333L21.573,18.807Z" style="fill:rgb(58,49,89);fill-rule:nonzero;"/>
                      </g>
                    </svg>
                    <span class="consequence__description">{{ consequence.description }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="sheet__trackers">
        <TrackingChip 
          v-for="tracker in trackers.trackers" 
          :key="tracker._id" 
          ref="trackerRefs"
          :tracker="tracker" 
        />
        <button class="sheet__add-tracker" type="button" @click="addTracker">
          <SvgIcon icon="Add" />
          <span v-if="trackers.trackers.length === 0" class="title">Add Tracker</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SvgIcon from '@/components/shared/SvgIcon.vue';
import { challengeStore, type Threat } from '@/sheet/stores/challenge/challengeStore';
import { nextTick, ref } from 'vue';
import { metaStore } from '@/sheet/stores/meta/metaStore';
import { trackersStore } from '@/sheet/stores/trackers/trackersStore';
import TrackingChip from '@/components/tracking/TrackingChip.vue';

const meta = metaStore();
const challenge = challengeStore();
const trackers = trackersStore();

const newThreat = ref<string>('');
const newLimit = ref<{ name: string; value: number | null }>({ name: '', value: null });
const newTagOrStatus = ref<{ name: string; value: number | null }>({ name: '', value: null });
const newMighty = ref<{ type: 'Origin' | 'Adventure' | 'Greatness'; description: string }>({ type: 'Origin', description: '' });
const newSpecialFeature = ref<{ name: string; description: string }>({ name: '', description: '' });

const newConsequence = ref<string>('');

const addConsequence = (threat:Threat) => {
  const description = newConsequence.value;
  if (description.trim() !== '') {
    const updatedThreat: Threat = {
      ...threat,
      consequences: [...threat.consequences, { ...challenge.getEmptyConsequence(), description }]
    }
    challenge.updateThreat(updatedThreat);
    newConsequence.value = '';
  }
};

const addLimit = () => {
  if (newLimit.value.name.trim() !== '') {
    challenge.updateLimit({ name: newLimit.value.name, value: newLimit.value.value ? newLimit.value.value : undefined });
    newLimit.value.name = '';
    newLimit.value.value = 0;
  }
};

const addTagOrStatus = () => {
  if (newTagOrStatus.value.name.trim() !== '') {
    challenge.updateTagOrStatus({ name: newTagOrStatus.value.name, value: newTagOrStatus.value.value ? newTagOrStatus.value.value : undefined });
    newTagOrStatus.value.name = '';
    newTagOrStatus.value.value = 0;
  }
};

const addMighty = () => {
  if (newMighty.value.description.trim() !== '') {
    challenge.updateMighty({ type: newMighty.value.type, description: newMighty.value.description });
    newMighty.value.description = '';
    newMighty.value.type = 'Origin';
  }
};

const addSpecialFeature = () => {
  if (newSpecialFeature.value.name.trim() !== '') {
    challenge.updateSpecialFeature({ name: newSpecialFeature.value.name, description: newSpecialFeature.value.description });
    newSpecialFeature.value.name = '';
    newSpecialFeature.value.description = '';
  }
};

const addThreat = () => {
  if (newThreat.value.trim() !== '') {
    challenge.updateThreat({ ...challenge.getEmptyThreat(), name: newThreat.value });
    newThreat.value = '';
  }
};

const trackerRefs = ref<InstanceType<typeof TrackingChip>[]>([]);
const addTracker = async () => {
  trackers.updateTracker();
  
  await nextTick();
  
  const lastRef = trackerRefs.value[trackerRefs.value.length - 1];
  if (lastRef?.$el) {
    const input = lastRef.$el.querySelector('input[type="text"]');
    if (input) {
      input.focus();
    }
  }
};
</script>

<style scoped lang="scss">
.view {
  --challenge-color-1: #4f311d;
  --challenge-color-2: #724a32;
  --challenge-color-3: #856b5b;
  --challenge-color-4: #e7e3d8;
  --challenge-color-5: #a13d29;
  --challenge-color-6: #d1a18d;
  padding: 20px 20px 90px 20px;
}
.mode {
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: var(--challenge-color-4);
  box-sizing: border-box;
  border: 2px solid var(--challenge-color-1);
  border-radius: 5px;
  opacity: 0.35;
  box-shadow: 0 0 10px var(--challenge-color-4);
  z-index: 9999;
  cursor: pointer;
  .svg-icon {
    width: 30px;
    height: 30px;
    fill: var(--challenge-color-1); 
  }
  &:hover {
    opacity: 0.75;
  }
  &--edit {
    border-color: var(--challenge-color-5);
    opacity: 1!important;
    .svg-icon {
      fill: var(--challenge-color-5);
    }
  }
}
.challenge {
  display:grid;
  grid-template-areas: "header header header"
                       "left-col divider right-col";
  grid-template-columns: 200px 2px 1fr;
  gap: 15px;

  font-size: 14px;
  
  .title {
    margin-bottom: 5px;
    display: block;
  }

  input[type="text"], input[type="number"] {
    height: 26px;
  }

  .action-button {
    width: 26px;
    height: 26px;
    box-sizing: border-box;
    cursor: pointer;
    background: transparent;
    border: 1px solid var(--challenge-color-1);
    border-radius: 5px;
    opacity: 0.35;
    display: flex;
    justify-content: center;
    align-items: center;
    .svg-icon {
      width: 16px;
      height: 16px;
      fill: var(--challenge-color-1); 
    }
    &:hover {
      opacity: 1;
    }
    &--add {
      &:hover {
        border-color: var(--color-positive);
        background-color: var(--color-positive);
        .svg-icon {
          fill: var(--color-card-title);
        }
      }
    }
    &--delete {
      &:hover {
        border-color: var(--color-negative);
        background-color: var(--color-negative);
        .svg-icon {
          fill: var(--color-card-title);
        }
      }
    }
  }
  
  .deleteable:has(> .action-button--delete:hover),
  .deleteable:has(.threat__meta .action-button--delete:hover),
  .deleteable:has(.limit__meta .action-button--delete:hover),
  .feature.deleteable:has(.action-button--delete:hover) {
    position: relative;
    &:after {
      content: '';
      position: absolute;
      top: -3px;
      left: -3px;
      width: calc(100% + 6px);
      height: calc(100% + 6px);
      background: rgba(255, 0, 0, 0.05);
      pointer-events: none;
    }
  }

  input, textarea {
    background: white;
    border: 1px solid #ccc;
    border-radius: 3px;
    box-sizing: border-box;
    width: 100%;
    padding: 3px;
  }

  svg {
    width: 16px;
    height: 16px;
  }

  &__header {
    grid-area: header;
  }
  &__left-col {
    grid-area: left-col;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  &__divider {
    grid-area: divider;
    background: white;
    width: 2px;
  }
  &__right-col {
    grid-area: right-col;
  }

  .actionable-row {
    display: grid;
    grid-template-columns: 1fr min-content;
    gap: 5px;
    align-items: center;
  }

  &__header {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-bottom: 10px;
  }

  .mighty__type {
    width: 100%;
    display: grid;
    grid-template-areas: "stack";
    .display, select {
      grid-area: stack;
    }
    select {
      width: 100%;
      opacity: 0;
    }
    .display {
      display: grid;
      grid-template-columns: 1fr 16px;
      align-items: center;
      background: white;
      border-radius: 3px;
      height: 23px;
      border: 1px solid #ccc;
      box-sizing: border-box;
      .svg-icon {
        justify-self: center;
        width: 15px;
        height: 15px;
      }
      span {
        text-align: center;
        font-size: 10px;
      }
      &--origin {
        .svg-icon {
          fill: #4d8061;
        }
      }
      &--adventure {
        .svg-icon {
          fill: #7d3c3c;
        }
      }
      &--greatness {
        .svg-icon {
          fill: #5b5b91;
        }
      }
    }
  }

  .title--dashed {
    &-left, &-center {
      display: grid;
      gap: 5px;
      font-family: var(--font-family-title);
      color: var(--challenge-color-3);
      &:before, &:after {
        height: 2px;
        background: var(--challenge-color-3);
        align-self: center;
      }
    }
    &-left {
      grid-template-columns: max-content 1fr;
      &:after {
        content: '';
      }
    }
    &-center {
      grid-template-columns: 1fr max-content 1fr;
      &:before, &:after {
        content: '';
      }
    }
  }

  &--edit {
    .threat {
      border-bottom-style: solid;
      border-bottom-width: 1px;
      border-image: linear-gradient(90deg, rgba(255,0,0,0) 0%, rgba(255,0,0,1) 50%, rgba(255,0,0,0) 100%);
      padding-bottom: 10px;
      margin-bottom: 10px;
      &__description {
        margin: 5px 0;
      }
    }
    .challenge__title {
      display: grid;
      grid-template-columns: 1fr 100px;
      gap: 5px;
      align-items: center;
    }
    .challenge__limits, .challenge__special-features {
      .list {
        gap: 10px;
      }
    }
    .consequence, .newconsequence {
      display: grid;
      grid-template-columns: 20px 1fr min-content;
      gap: 5px;
      align-items: center;
    }
    .limit, .newlimit {
      &__meta {
        display: grid;
        grid-template-columns: 1fr 60px min-content;
        gap: 5px;
        align-items: center;
      }
      textarea {
        margin-top: 5px;
      }
    }
    .tag-or-status, .newtag-or-status {
      display: grid;
      grid-template-columns: 1fr 60px min-content;
      gap: 5px;
      align-items: center;
    }
    .mighty, .newmighty {
      display: grid;
      grid-template-columns: 40px 1fr min-content;
      gap: 5px;
    }
    .feature {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
  }

  &--view {
    .challenge__title {
      display: flex;
      gap: 15px;
      align-items: center;
      h1 {
        font-family: var(--font-family-title);
        text-transform: uppercase;
        color: var(--challenge-color-1);
      }
      .challenge__rating {
        display: flex;
        gap: 2px;
        .svg-icon {
          width: 20px;
          height: 20px;
          fill: var(--challenge-color-1);
        }
      }
    }
    .challenge__roles {
      font-weight: bold;
      font-size: 18px;
      font-style: italic;
      color: var(--challenge-color-2);
      margin-top: -10px;
      margin-bottom: 5px;
    }
    .challenge__description {
      // max-width: 300px;
      // margin: 0 auto;
    }
    .threat {
      &:not(:last-child) {
        border-bottom-style: solid;
        border-bottom-width: 1px;
        border-image: linear-gradient(90deg, var(--challenge-color-3) 0%, var(--challenge-color-4) 75%) 1;
        padding-bottom: 10px;
        margin-bottom: 10px;
      }
      &__meta {
        line-height: calc(1em + 5px);
      }
      &__name {
        padding: 2px 5px;
        background: #cfbfb4;
        border-radius: 3px;
        margin-right: 5px;
        font-weight: bold;
        text-transform: uppercase;
      }
      &__consequences {
        .list {
          margin: 5px 0;
          .consequence {
            display: grid;
            grid-template-columns: min-content 1fr;
            align-items: center;
            gap: 5px;
          }
        }
      }
    }
    .limit {
      position: relative;
      &__meta {
        display: grid;
        grid-template-columns: max-content min-content;
        align-items: center;
        .limit__name {
          background: var(--challenge-color-6);
          padding: 2px 5px;
          width: calc(100% + 14px);
          text-transform: uppercase;
          font-weight: bold;
          border-radius: 3px;
          box-sizing: border-box;
        }
        .limit__shield {
          display: grid;
          grid-template-areas: "stack";
          justify-content: center;
          align-items: center;
          span, .svg-icon {
            grid-area: stack;
          }
          span {
            color: #e2d2c1;
            font-weight: bold;
            text-align: center;
            font-size: 16px;
          }
          .svg-icon {
            height: 28px;
            width: 28px;
            fill: var(--challenge-color-5);
          }
        }
      }
      &__description {
        padding-left: 18px;
      }
      > .svg-icon {
        position: absolute;
        top: 25px;
        left: 0px;
        width: 14px;
        height: 14px;
      }
    }
    .mighty {
      display: grid;
      grid-template-columns: 20px 1fr;
      gap: 2px;
      align-items: center;
      .display {
        width: 16px;
        height: 16px;
        .svg-icon {
          width: 16px;
          height: 16px;
        }
        &--origin {
          .svg-icon {
            fill: #4d8061;
          }
        }
        &--adventure {
          .svg-icon {
            fill: #7d3c3c;
          }
        }
        &--greatness {
          .svg-icon {
            fill: #5b5b91;
          }
        }
      }
    }
    .feature {
      .feature__name {
        font-weight: bold;
        text-transform: uppercase;
        margin-right: 2px;
      }
    }
  }
  .sheet__trackers {
    margin-top: 20px;
    grid-column: 1 / -1;
    .chip {
      box-shadow: none!important;
    }
    .sheet__add-tracker {
      &:hover {
        box-shadow: none!important;
      }
    }
  }
}
</style>