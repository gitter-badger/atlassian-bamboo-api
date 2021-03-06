"use strict";

import Bamboo from '../lib/bamboo';
import expect from 'expect.js';
import requestMock from 'nock';

let baseTestUrl       = 'http://example.com',
    testPlanKey       = 'myPrj-myPlan',
    testApiUrl        = '/rest/api/latest/result',
    testPlanResultUrl = testApiUrl + '/' + testPlanKey + '.json',
    testPlanLatest    = '/rest/api/latest/plan.json';

describe('Bamboo', () => {

    describe('getLatestSuccessfulBuildNumber', () => {

        it('returns the latest successful build number', (done) => {
            requestMock(baseTestUrl)
                .get(testPlanResultUrl + '?1')
                .reply(200, JSON.stringify({
                    results: {
                        result: [
                            {number: '23', state: 'Failed'},
                            {number: '22', state: 'Successful'}
                        ]
                    }
                }));

            let bamboo = new Bamboo(baseTestUrl);
            bamboo.getLatestSuccessfulBuildNumber(testPlanKey, '?1', (error, result) => {
                expect(error).to.be(null);
                expect(result).to.eql('22');
                done();
            });
        });

        it('returns a msg when the plan doesn\'t contain any successful build', (done) => {
            requestMock(baseTestUrl)
                .get(testPlanResultUrl + '?2')
                .reply(200, JSON.stringify({
                    results: {
                        result: [
                            {number: '23', state: 'Failed'},
                            {number: '22', state: 'Failed'}
                        ]
                    }
                }));

            let bamboo = new Bamboo(baseTestUrl);
            bamboo.getLatestSuccessfulBuildNumber(testPlanKey, '?2', (error, result) => {
                expect(error.toString()).to.eql('Error: The plan doesn\'t contain any successful build');
                expect(result).to.be(null);
                done();
            });
        });

        it('returns a msg when the plan doesn\'t contain any successful build', (done) => {
            requestMock(baseTestUrl)
                .get(testPlanResultUrl + '?3')
                .reply(200, JSON.stringify({
                    results: {
                        size:          3,
                        'max-result':  2,
                        'start-index': 0,
                        result:        [
                            {number: '23', state: 'Failed'},
                            {number: '22', state: 'Failed'}
                        ]
                    }
                }));

            requestMock(baseTestUrl)
                .get(testPlanResultUrl + '?start-index=2')
                .reply(200, JSON.stringify({
                    results: {
                        size:          3,
                        'max-result':  1,
                        'start-index': 2,
                        result:        [
                            {number: '21', state: 'Failed'}
                        ]
                    }
                }));

            let bamboo = new Bamboo(baseTestUrl);
            bamboo.getLatestSuccessfulBuildNumber(testPlanKey, '?3', (error, result) => {
                expect(error.toString()).to.eql('Error: The plan doesn\'t contain any successful build');
                expect(result).to.be(null);
                done();
            });
        });

        it('returns a msg when the plan doesn\'t contain any result', (done) => {
            requestMock(baseTestUrl)
                .get(testPlanResultUrl + '?4')
                .reply(200, JSON.stringify({
                    results: {
                        result: []
                    }
                }));

            let bamboo = new Bamboo(baseTestUrl);
            bamboo.getLatestSuccessfulBuildNumber(testPlanKey, '?4', (error, result) => {
                expect(error.toString()).to.eql('Error: The plan doesn\'t contain any result');
                expect(result).to.be(null);
                done();
            });
        });


        it('returns a msg when the plan doesn\'t exist', (done) => {
            requestMock(baseTestUrl)
                .get(testPlanResultUrl + '?5')
                .reply(404);

            let bamboo = new Bamboo(baseTestUrl);
            bamboo.getLatestSuccessfulBuildNumber(testPlanKey, '?5', (error, result) => {
                expect(error.toString()).to.eql('Error: Unreachable endpoint');
                expect(result).to.be(null);
                done();
            });
        });

        it('returns the latest successful build number in multiple \'requests\'', (done) => {
            requestMock(baseTestUrl)
                .get(testPlanResultUrl + '?6')
                .reply(200, JSON.stringify({
                    results: {
                        size:          3,
                        'max-result':  2,
                        'start-index': 0,
                        result:        [
                            {number: '23', state: 'Failed'},
                            {number: '22', state: 'Failed'}
                        ]
                    }
                }));

            requestMock(baseTestUrl)
                .get(testPlanResultUrl + '?start-index=2')
                .reply(200, JSON.stringify({
                    results: {
                        size:          3,
                        'max-result':  1,
                        'start-index': 2,
                        result:        [
                            {number: '21', state: 'Successful'}
                        ]
                    }
                }));

            let bamboo = new Bamboo(baseTestUrl);
            bamboo.getLatestSuccessfulBuildNumber(testPlanKey, '?6', (error, result) => {
                expect(error).to.be(null);
                expect(result).to.eql('21');
                done();
            });
        })
    });

    describe('getBuildStatus', () => {

        it('returns the build Status', (done) => {
            requestMock(baseTestUrl)
                .get(testApiUrl + '/' + testPlanKey + '/416.json')
                .reply(200, JSON.stringify({
                    lifeCycleState: 'InProgress'
                }));

            let bamboo = new Bamboo(baseTestUrl);
            bamboo.getBuildStatus(testPlanKey + '/416', (error, result) => {
                expect(error).to.be(null);
                expect(result).to.eql('InProgress');
                done();
            });
        });
    });

    describe('getLatestBuildStatus', () => {

        it('returns the latest build Status', (done) => {

            requestMock(baseTestUrl)
                .get(testPlanResultUrl)
                .reply(200, JSON.stringify({
                    results: {
                        result: [
                            {number: '23', state: 'Failed'},
                            {number: '22', state: 'Failed'},
                            {number: '21', state: 'Successful'}
                        ]
                    }
                }));

            let bamboo = new Bamboo(baseTestUrl);
            bamboo.getLatestBuildStatus(testPlanKey, (error, state, number) => {
                expect(error).to.be(null);
                expect(state).to.eql('Failed');
                expect(number).to.eql('23');
                done();
            });
        });

        it('returns the latest build Status', (done) => {

            requestMock(baseTestUrl)
                .get(testPlanResultUrl)
                .reply(200, JSON.stringify({
                    results: {
                        size:          3,
                        'max-result':  1,
                        'start-index': 0,
                        result:        []
                    }
                }));

            let bamboo = new Bamboo(baseTestUrl);
            bamboo.getLatestBuildStatus(testPlanKey, (error, state, number) => {
                expect(error.toString()).to.eql('Error: The plan doesn\'t contain any result');
                expect(state).to.be(null);
                expect(number).to.be(null);
                done();
            });
        });
    });

    describe('getAllPlans', () => {

        it('returns a list of all plans available', (done) => {

            requestMock(baseTestUrl)
                .get(testPlanLatest)
                .reply(200, JSON.stringify({
                    plans: {
                        size:          3,
                        'max-result':  2,
                        'start-index': 0,
                        plan:          [
                            {key: 'AA-BB', name: 'Full name1'},
                            {key: 'CC-DD', name: 'Full name2'}
                        ]
                    }
                }));

            requestMock(baseTestUrl)
                .get(testPlanLatest + '?start-index=2')
                .reply(200, JSON.stringify({
                    plans: {
                        size:          5,
                        'max-result':  2,
                        'start-index': 2,
                        plan:          [
                            {key: 'EE-FF', name: 'Full name3'},
                            {key: 'GG-HH', name: 'Full name4'}
                        ]
                    }
                }));

            requestMock(baseTestUrl)
                .get(testPlanLatest + '?start-index=4')
                .reply(200, JSON.stringify({
                    plans: {
                        size:          5,
                        'max-result':  1,
                        'start-index': 4,
                        plan:          [
                            {key: 'II-LL', name: 'Full name5'}
                        ]
                    }
                }));

            let bamboo = new Bamboo(baseTestUrl);
            bamboo.getAllPlans('', (error, result) => {
                expect(error).to.be(null);
                expect(result).to.eql([
                    {key: 'AA-BB', name: 'Full name1'},
                    {key: 'CC-DD', name: 'Full name2'},
                    {key: 'EE-FF', name: 'Full name3'},
                    {key: 'GG-HH', name: 'Full name4'},
                    {key: 'II-LL', name: 'Full name5'}
                ]);
                done();
            });
        });

        it('returns a string saying that there are no plans', (done) => {

            requestMock(baseTestUrl)
                .get(testPlanLatest)
                .reply(200, JSON.stringify({
                    plans: {
                        size:          3,
                        'max-result':  1,
                        'start-index': 0,
                        plan:          []
                    }
                }));

            let bamboo = new Bamboo(baseTestUrl);
            bamboo.getAllPlans('', (error, result) => {
                expect(error.toString()).to.eql('Error: No plans available');
                expect(result).to.be(null);
                done();
            });
        });

    });

    describe('getArtifactContent', () => {

        it('returns the latest successful build number', (done) => {

            requestMock(baseTestUrl)
                .get('/browse/myPrj-myPlan-234/artifact/shared/name1/name1')
                .reply(200, 'AAA');

            let bamboo = new Bamboo(baseTestUrl);
            bamboo.getArtifactContent('myPrj-myPlan-234', 'name1', (error, result) => {
                expect(error).to.be(null);
                expect(result).to.eql('AAA');
                done();
            });
        });
    });


    describe('getJiraIssuesFromBuild', () => {

        it('returns the list of JIRA task from a build - no dependent plan', (done) => {

            requestMock(baseTestUrl)
                .get(testApiUrl + '/plan1-234.json?expand=jiraIssues')
                .reply(200, JSON.stringify({
                    buildReason: '',
                    jiraIssues:  {
                        issue: [
                            {key: 'AAA'},
                            {key: 'BBB'}
                        ]
                    }
                }));

            let bamboo = new Bamboo(baseTestUrl);
            bamboo.getJiraIssuesFromBuild('plan1-234', (error, result) => {
                expect(error).to.be(null);
                expect(result).to.eql(['AAA', 'BBB']);
                done();
            });
        });

        it('returns the list of JIRA task from a build - dependent on planB', (done) => {

            requestMock(baseTestUrl)
                .get(testApiUrl + '/plan1-234.json?expand=jiraIssues')
                .reply(200, JSON.stringify({
                    buildReason: 'Child of <a>plan2-99</a>',
                    jiraIssues:  {
                        issue: [
                            {key: 'AAA'},
                            {key: 'BBB'}
                        ]
                    }
                }));

            requestMock(baseTestUrl)
                .get(testApiUrl + '/plan2-99.json?expand=jiraIssues')
                .reply(200, JSON.stringify({
                    buildReason: 'Child of <a>plan3-11</a>',
                    jiraIssues:  {
                        issue: [
                            {key: 'CCC'},
                            {key: 'BBB'}
                        ]
                    }
                }));

            requestMock(baseTestUrl)
                .get(testApiUrl + '/plan3-11.json?expand=jiraIssues')
                .reply(200, JSON.stringify({
                    buildReason: 'Changes by <a>XX</a>',
                    jiraIssues:  {
                        issue: [
                            {key: 'DDD'},
                            {key: 'EEE'}
                        ]
                    }
                }));

            let bamboo = new Bamboo(baseTestUrl);
            bamboo.getJiraIssuesFromBuild('plan1-234', (error, result) => {
                expect(error).to.be(null);
                expect(result).to.eql(['AAA', 'BBB', 'CCC', 'DDD', 'EEE']);
                done();
            });
        });
    });

    describe('getChangesFromBuild', () => {

        it('returns the list of changes from a build - no dependent plan', (done) => {

            requestMock(baseTestUrl)
                .get(testPlanResultUrl + '?expand=changes')
                .reply(200, JSON.stringify({
                    changes: {
                        change: [
                            {fullName: 'a b'},
                            {fullName: 'c d'}
                        ]
                    }
                }));

            let bamboo = new Bamboo(baseTestUrl);
            bamboo.getChangesFromBuild(testPlanKey, (error, result) => {
                expect(error).to.be(null);
                expect(result).to.eql(['a b', 'c d']);
                done();
            });
        });

        it('returns the list of JIRA task from a build - dependent on planB', (done) => {

            requestMock(baseTestUrl)
                .get(testApiUrl + '/plan1-234.json?expand=changes')
                .reply(200, JSON.stringify({
                    buildReason: 'Child of <a>plan2-99</a>',
                    changes:     {
                        change: [
                            {fullName: 'a b'},
                            {fullName: 'c d'}
                        ]
                    }
                }));

            requestMock(baseTestUrl)
                .get(testApiUrl + '/plan2-99.json?expand=changes')
                .reply(200, JSON.stringify({
                    buildReason: 'Child of <a>plan3-11</a>',
                    changes:     {
                        change: [
                            {fullName: 'e f'},
                            {fullName: 'g h'}
                        ]
                    }
                }));

            requestMock(baseTestUrl)
                .get(testApiUrl + '/plan3-11.json?expand=changes')
                .reply(200, JSON.stringify({
                    buildReason: 'Changes by <a>XX</a>',
                    changes:     {
                        change: [
                            {fullName: 'i j'},
                            {fullName: 'k l'}
                        ]
                    }
                }));

            let bamboo = new Bamboo(baseTestUrl);
            bamboo.getChangesFromBuild('plan1-234', (error, result) => {
                expect(error).to.be(null);
                expect(result).to.eql(['a b', 'c d', 'e f', 'g h', 'i j', 'k l']);
                done();
            });
        });
    });

    describe('base http authentication, test on bamboo.getLatestSuccessfulBuildNumber method', () => {

        let username    = 'testuser',
            password    = 'testpassword',
            authString  = username + ':' + password,
            encrypted   = (new Buffer(authString)).toString('base64'),
            planKey     = 'myPrjAuth-myPlanAuth',
            result      = JSON.stringify({
                results: {
                    result: [
                        {number: '22', state: 'Successful'},
                        {number: '23', state: 'Failed'}
                    ]
                }
            }),
            headerMatch = (val) => { return val === 'Basic ' + encrypted; };

        requestMock(baseTestUrl)
            .get(testApiUrl + '/' + planKey + '.json')
            .matchHeader('Authorization', headerMatch)
            .reply(200, result);

        it('should fail, since require authentication', (done) => {
            let bamboo = new Bamboo(baseTestUrl);

            bamboo.getLatestSuccessfulBuildNumber(planKey, false, (error, result) => {
                expect(result).to.be(null);
                done();
            });
        });


        it('returns the latest successful build number', (done) => {
            let bamboo = new Bamboo(baseTestUrl, username, password);

            bamboo.getLatestSuccessfulBuildNumber(planKey, false, (error, result) => {
                expect(error).to.be(null);
                expect(result).to.be('22');
                done();
            });
        });
    });

});